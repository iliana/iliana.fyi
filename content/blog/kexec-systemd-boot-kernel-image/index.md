---
title: "Building an x86 Linux kernel that works with both systemd-boot and kexec"
date: 2023-10-22T12:00:00-07:00
---

<div class="[tab-size:8]">

I'm working on a project that uses [Buildroot](https://buildroot.org/) to build an embedded Linux system for a relatively standard x86 server board. I've configured it to produce a single Linux kernel image with an embedded initramfs; Buildroot has special support (via `BR2_TARGET_ROOTFS_INITRAMFS`) to build the kernel a second time using Linux's `CONFIG_INITRAMFS_SOURCE` option and embed the root filesystem into the kernel code. This is pretty neat, as it allows you to have a single compressed, bootable file containing the entire system. With `CONFIG_EFI_STUB`, it's even EFI bootable, and it works out of the box with [`kexec`](https://lwn.net/Articles/15468/).

I decided I wanted to see if I could get these images working with [systemd-boot][systemd-boot]. systemd-boot refers to [The Boot Loader Specification][bls], which describes the two methods systemd-boot uses to look for something to boot; the first is somewhat similar to existing x86 bootloaders which have a list of entries and their associated kernels, initrds, command lines, and other metadata. The second method refers to an "EFI Unified Kernel Image" (abbreviated to "UKI" in places other than the Boot Loader Specification). I already have an EFI image with my initramfs and command line embedded within it; how hard could it be?

A unified kernel image is a Portable Executable, like all EFI images. The Boot Loader Specification requires that the PE binary contain an `.osrel` section consisting of the contents of the os-release file for the system; this is used by systemd-boot to display a name and version of the OS. In the systemd cinematic universe, this is usually provided by [systemd-stub](https://www.freedesktop.org/software/systemd/man/latest/systemd-stub.html), a UEFI kernel boot stub that also defines separate sections for the Linux kernel itself, an initrd, kernel version information, binary devicetree, kernel command line, and boot splash. This is advantageous for some use cases with traditional distributions, where a kernel is normally built by a distribution and the initrd is built by the end-user; an end-user can combine everything into a single, signed UEFI binary. But a UKI is not a kernel image, as far as `kexec` is concerned; [perhaps it could be someday](https://lore.kernel.org/kexec/20230911052535.335770-1-kernel@jfarr.cc/T/).

So if we want to learn to live with both of these constraints, we need to add an `.osrel` PE section to our existing kernel image. It is tempting to reach for `objcopy`, which can add sections to PE binaries, but note that a kernel image built with `CONFIG_EFI_STUB` is bootable by both BIOS bootloaders and UEFI; it is a polyglot! x86 has a rich and wild history and [the Linux/x86 boot protocol](https://www.kernel.org/doc/html/v5.6/x86/boot.html) reflects this. The kernel setup code relies on absolute offsets in this file, so a tool that believes the kernel image is a true PE binary will render it universally unbootable.

Instead we need to reach straight into the guts of our boot executable. (Links and patches below apply to Linux 6.1.51.) The PE binary header is faked into the Linux `bzImage` in [`arch/x86/boot/header.S`](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/tree/arch/x86/boot/header.S?h=v6.1.51):

```asm
#ifdef CONFIG_EFI_STUB
pe_header:
	.long	PE_MAGIC

	# [... snipped from original for brevity ...]

	# Section table
section_table:
	#
	# The offset & size fields are filled in by build.c.
	#
	.ascii	".setup"
	.byte	0
	.byte	0
	.long	0
	.long	0x0				# startup_{32,64}
	.long	0				# Size of initialized data
						# on disk
	.long	0x0				# startup_{32,64}
	.long	0				# PointerToRelocations
	.long	0				# PointerToLineNumbers
	.word	0				# NumberOfRelocations
	.word	0				# NumberOfLineNumbers
	.long	IMAGE_SCN_CNT_CODE			| \
		IMAGE_SCN_MEM_READ			| \
		IMAGE_SCN_MEM_EXECUTE		| \
		IMAGE_SCN_ALIGN_16BYTES		# Characteristics

	#
	# The EFI application loader requires a relocation section
	# because EFI applications must be relocatable. The .reloc
	# offset & size fields are filled in by build.c.
	#
	.ascii	".reloc"
	.byte	0
	.byte	0
	.long	0
	.long	0
	.long	0				# SizeOfRawData
	.long	0				# PointerToRawData
	.long	0				# PointerToRelocations
	.long	0				# PointerToLineNumbers
	.word	0				# NumberOfRelocations
	.word	0				# NumberOfLineNumbers
	.long	IMAGE_SCN_CNT_INITIALIZED_DATA	| \
		IMAGE_SCN_MEM_READ		| \
		IMAGE_SCN_MEM_DISCARDABLE	| \
		IMAGE_SCN_ALIGN_1BYTES		# Characteristics
```

We add our own section below `.reloc` (and before the `.compat` section defined if `CONFIG_EFI_MIXED` is set):

```asm
	#
	# systemd-boot requires an .osrel section containing the
	# contents of /etc/os-release. The .osrel offset & size
	# fields are filled in by build.c.
	#
	.ascii	".osrel"
	.byte	0
	.byte	0
	.long	0
	.long	0
	.long	0				# SizeOfRawData
	.long	0				# PointerToRawData
	.long	0				# PointerToRelocations
	.long	0				# PointerToLineNumbers
	.word	0				# NumberOfRelocations
	.word	0				# NumberOfLineNumbers
	.long	IMAGE_SCN_CNT_INITIALIZED_DATA	| \
		IMAGE_SCN_MEM_READ		| \
		IMAGE_SCN_MEM_DISCARDABLE	| \
		IMAGE_SCN_ALIGN_1BYTES		# Characteristics
```

<ili-tangent>

The PE header requires listing the number of sections in the section header, but lucky for us [someone already set it up to dynamically update](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/tree/arch/x86/boot/header.S?h=v6.1.51#n276):

```asm
	.set	section_count, (. - section_table) / 40
```

</ili-tangent>

As the comment we wrote indicates, we also need to update [`arch/x86/boot/tools/build.c`](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/tree/arch/x86/boot/tools/build.c?h=v6.1.51), which fills real values into all the placeholders in `header.S`.

For my purposes, I decided I would copy in the os-release contents after the kernel build, so I reserved a 256-byte section for it:

```c
#define PECOFF_OSREL_RESERVE 0x100
```

<ili-tangent>

If I were considering upstreaming this, I would probably add an option named `CONFIG_EFI_OSREL` that takes a path to an os-release file to embed, and change `build.c` to read that path and reserve only the space necessary instead of hardcoding the size at `0x100`. But I am not, and I don't want to figure out how that would work within Buildroot either.

</ili-tangent>

In `update_pecoff_setup_and_reloc`, we update the offset calculations for the surrounding sections:

<!-- In Firefox, these tabs with leading diff characters still render as 8 characters, instead of stopping at the next tab stop. -->
<div class="[tab-size:7]">

```diff
 static void update_pecoff_setup_and_reloc(unsigned int size)
 {
 	u32 setup_offset = 0x200;
-	u32 reloc_offset = size - PECOFF_RELOC_RESERVE - PECOFF_COMPAT_RESERVE;
+	u32 reloc_offset = size - PECOFF_RELOC_RESERVE - PECOFF_OSREL_RESERVE - PECOFF_COMPAT_RESERVE;
+	u32 osrel_offset = reloc_offset + PECOFF_RELOC_RESERVE;
 #ifdef CONFIG_EFI_MIXED
-	u32 compat_offset = reloc_offset + PECOFF_RELOC_RESERVE;
+	u32 compat_offset = osrel_offset + PECOFF_OSREL_RESERVE;
 #endif
 	u32 setup_size = reloc_offset - setup_offset;

 	update_pecoff_section_header(".setup", setup_offset, setup_size);
 	update_pecoff_section_header(".reloc", reloc_offset, PECOFF_RELOC_RESERVE);

 	/*
 	 * Modify .reloc section contents with a single entry. The
 	 * relocation is applied to offset 10 of the relocation section.
 	 */
 	put_unaligned_le32(reloc_offset + 10, &buf[reloc_offset]);
 	put_unaligned_le32(10, &buf[reloc_offset + 4]);

+	update_pecoff_section_header(".osrel", osrel_offset, PECOFF_OSREL_RESERVE);
+
 #ifdef CONFIG_EFI_MIXED
 	update_pecoff_section_header(".compat", compat_offset, PECOFF_COMPAT_RESERVE);

 	/*
 	 * Put the IA-32 machine type (0x14c) and the associated entry point
 	 * address in the .compat section, so loaders can figure out which other
 	 * execution modes this image supports.
 	 */
 	buf[compat_offset] = 0x1;
 	buf[compat_offset + 1] = 0x8;
 	put_unaligned_le16(0x14c, &buf[compat_offset + 2]);
 	put_unaligned_le32(efi32_pe_entry + size, &buf[compat_offset + 4]);
 #endif
 }
```

And then in `main`, we need to reserve the `.osrel` section:

```diff
 	c += reserve_pecoff_compat_section(c);
+	memset(buf+c, 0, PECOFF_OSREL_RESERVE);
+	c += PECOFF_OSREL_RESERVE;
 	c += reserve_pecoff_reloc_section(c);
```

</div><!-- /[tab-size:7] -->

That covers all the changes we need to make to have an reserved 256-byte `.osrel` section in the kernel image. To fill it in, we still need to avoid `objcopy`; I wrote a short Python script to do the job. Take note of the fact that we need to shorten _both_ the `size` and `datasz` fields to fit the actual length of the os-release file; [systemd-boot will not accept an `.osrel` section with multiple null bytes](https://github.com/systemd/systemd/blob/e8dc52766e1fdb4f8c09c3ab654d1270e1090c8d/src/shared/bootspec.c#L841-L843)![^nl] (Perhaps the Boot Loader Specification could specify this?)

[^nl]: If you don't want to resize the section, you could pad the file with empty lines, I guess.

```python
import collections
import mmap
import struct
import sys

Section = collections.namedtuple("Section", ["name", "size", "vma", "datasz", "offset"])

# Usage: python osrel.py OS_RELEASE_FILE KERNEL_BZIMAGE
osrel = open(sys.argv[1], "rb").read()
kernel = open(sys.argv[2], "r+b")
mm = mmap.mmap(kernel.fileno(), 0)

pe_header = struct.unpack("<i", mm[0x3C:0x40])[0]
num_sections = struct.unpack("<h", mm[pe_header + 6 : pe_header + 8])[0]
section_table = pe_header + 0xB8

for start in map(lambda i: section_table + i * 40, range(num_sections)):
    s = Section(*struct.unpack("<8s4i", mm[start : start + 24]))
    if s.name == b".osrel\0\0":
        size = min(len(osrel), s.size)
        s = s._replace(size=size, datasz=size)
        mm[s.offset : s.offset + s.size] = osrel[: s.size]
        mm[start : start + 24] = struct.pack("<8s4i", *s)
        break
```

After all is said and done, we can indeed verify the section looks right with `objdump`:

```
$ objdump -s -j .osrel output/images/bzImage-latest

output/images/bzImage-latest:     file format pei-x86-64

Contents of section .osrel:
 1003d00 4e414d45 3d576f62 7363616c 65205275  NAME=Wobscale Ru
 1003d10 690a4944 3d727569 0a49445f 4c494b45  i.ID=rui.ID_LIKE
 1003d20 3d627569 6c64726f 6f740a56 45525349  =buildroot.VERSI
 1003d30 4f4e5f49 443d3230 32332e30 322e352d  ON_ID=2023.02.5-
 1003d40 37342d67 66346563 34313065 34340a42  74-gf4ec410e44.B
 1003d50 55494c44 5f49443d 66346563 34313065  UILD_ID=f4ec410e
 1003d60 34343434 36333333 32366262 30323935  4444633326bb0295
 1003d70 32346166 35336161 37326531 63363064  24af53aa72e1c60d
 1003d80 0a                                   .
```

And with `bootctl`, after placing our binary in the magic location on the EFI System Partition:

```
Default Boot Loader Entry:
         type: Boot Loader Specification Type #2 (.efi)
        title: Wobscale Rui (2023.02.5-74-gf4ec410e44)
           id: rui-2023.02.5-74-gf4ec410e44.efi
       source: /boot/EFI/Linux/rui-2023.02.5-74-gf4ec410e44.efi
     sort-key: rui
      version: 2023.02.5-74-gf4ec410e44
        linux: EFI/Linux/rui-2023.02.5-74-gf4ec410e44.efi
```

And, finally, `kexec` is happy with it too:

```
# kexec --kexec-file-syscall --load /boot/EFI/Linux/rui-2023.02.5-74-gf4ec410e44.efi
# echo $?
0
```

<ili-tangent>

[Here's a full, ready-to-`git am` patch](efi-stub-osrel-section.patch) of my Linux changes, with more correct handling for building without `CONFIG_EFI_STUB`. Feel free to adapt to your needs, or improve and upstream it; just keep the `Signed-off-by:` line around.

</ili-tangent>

[systemd-boot]: https://www.freedesktop.org/software/systemd/man/latest/systemd-boot.html
[bls]: https://uapi-group.org/specifications/specs/boot_loader_specification/

</div><!-- /[tab-size:8] -->
