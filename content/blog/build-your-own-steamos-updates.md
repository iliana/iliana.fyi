---
title: "How I forked SteamOS for my living room PC"
date: 2023-12-29T12:00:00-08:00
---

SteamOS 3 ("Holo") is the Arch-based Linux distribution built for the Steam Deck, Valve Software's portable PC gaming device. It's a very interesting Linux distribution even when you only focus on how it updates itself: updates are performed atomically by downloading a new read-only root filesystem to an inactive partition, then rebooting into that partition. But consumers can also run `steamos-devmode` to unlock the root filesystem, put the pacman database in working order, and give them a working Linux distro with a normal package manager.

This A/B atomic updates system is pretty standard for OSes these days, but there's a lot going on in SteamOS that makes them work even with heavy customization by the end-user. I wanted to explore that while still being able to make changes to the root filesystem images. `steamos-devmode` is the easy way out; I wanted to make a proper fork. Here's how I did it.

<ili-callout>

I use these instructions, but am providing them here to help publicly document some of what SteamOS does. I'm not responsible for you breaking your Steam Deck, and if you send me questions asking why these steps don't work for you I won't answer.

</ili-callout>

## Why?

I don't own a Steam Deck. A bunch of my friends do, but they know better than to let me have root access on a device they actually like using. What I do have is a recently-built living room PC that I wanted to play games on... and SteamOS seemed like a reasonable choice. It almost even worked perfectly out of the box, although I think that is primarily because I built a computer that looks vaguely similar to a really heavy, battery-less Steam Deck[^fragile].

[^fragile]: The similarities don't end with just having an AMD CPU and GPU and an NVMe SSD; similar to how Valve says [you shouldn't open your Steam Deck](https://www.youtube.com/watch?v=Dxnr2FAADAs) because it will immediately make it less structurally resilient, you also shouldn't open my living room PC because you might damage the precision-bent PCI slot cover plate keeping the graphics hovering above the case fans I had to use to replace the GPU fan shroud that wouldn't fit in the case.

The one thing that didn't work was resume from suspend. Other distributions running on my computer using mainline or stable kernels did. Eventually, I found [the sources for Valve's kernel](https://steamdeck-packages.steamos.cloud/archlinux-mirror/sources/) (it's weird, I'll explain when we get there) and started a `git bisect`, leading me to a commit that seems to fix resume from suspend on Steam Deck hardware, but ultimately breaks it on mine. Needing to revert this commit and do my own build is the ultimate reason I headed down this path.

At several points in this process my partner asked if this made more sense than just using Arch or something else directly. I still don't know the answer, although I think I still prefer relying on a Valve-tested set of packages than whatever's current in the Arch repos. If I'm going to have to tinker with a Linux distro for running games, it may as well be one that people actually test their games on.

I apparently have a tendency to make poor choices like this, because you are reading the second post in what has become a series on [installing Linux distros onto systems they're not ready for yet](https://iliana.fyi/blog/installing-fedora-on-mac-mini/).

## SteamOS in a nutshell

A SteamOS system has eight partitions. The stage 1 bootloader is stored on the EFI system partition, along with metadata files that describe the two A/B partition sets and how to choose which one to boot. Each of the two partition sets contains a stage 2 bootloader (GRUB), the root filesystem, and a `/var` partition. Finally, there's a single `home` partition that fills the rest of the disk.

```
Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048          133119   64.0 MiB    EF00  esp
   2          133120          198655   32.0 MiB    0700  efi-A
   3          198656          264191   32.0 MiB    0700  efi-B
   4          264192        10749951   5.0 GiB     8304  rootfs-A
   5        10749952        21235711   5.0 GiB     8304  rootfs-B
   6        21235712        21759999   256.0 MiB   8310  var-A
   7        21760000        22284287   256.0 MiB   8310  var-B
   8        22284288      4000797319   1.9 TiB     8302  home
```

When the system boots, a number of other pseudo-filesystems get mounted. Almost a dozen directories, including `/var/log`, `/root`, and `/nix`, are bind-mounted from `/home/.steamos/offload` to keep their data persistent.

Perhaps my favorite detail of SteamOS is how it handles `/etc`: it mounts an overlayfs on top of it, with modifications persisted at `/var/lib/overlays/etc/upper`. This allows persisting the usual things that need to be persisted in `/etc` (e.g. the `machine-id` file, NetworkManager connections) while allowing updates to untouched configuration files. Most Linux package managers have similar behaviors around `/etc`, only updating config files that haven't been changed from their defaults, but Valve's approach makes this work with the A/B partition system without any package manager logic.

A system update is started when the Steam client, or a user in a terminal, runs `steamos-update`. This runs a Python program, `steamos-atomupd-client`, which sends a request containing the current OS information and the user's update channel configuration to the URLs in `/etc/steamos-atomupd/client.conf` in order to determine whether there is a new update.

If there is, the servers respond with a path to a [RAUC bundle](https://rauc.io/), which the client downloads and runs `rauc install` on. RAUC verifies the signature of the bundle and looks for the `rootfs.img.caibx` file, then runs `casync extract` to download all the necessary pieces of the new image and write them to the inactive rootfs partition. RAUC then runs a post-install script that selectively[^selectively] synchronizes data from the active `/var` partition to the inactive `/var` partition, and modifies the stage 1 bootloader configuration on the EFI system partition to boot into the newly-written partition set.

[^selectively]: The [`sync_var_mountpoints` function in `/usr/lib/rauc/post-install.sh`](https://gist.github.com/iliana/44c53bfa7eab4f04e952d6387d3e70ae#file-post-install-sh-L216-L243) has an excellent comment explaining why some files need to be excluded when synchronizing `/var` between the partition sets.

## Patching the kernel

Valve uses a heavily-modified Linux kernel in SteamOS. We can know this because we can readily download the sources. It's a little more convoluted than `git clone`, but not by much. Their [pacman mirror](https://steamdeck-packages.steamos.cloud/archlinux-mirror/) can be found in `/etc/pacman.d/mirrorlist`, and the sources used for current (as of writing) SteamOS images are in the `sources/holo-3.5` and `sources/jupiter-3.5`. Right now, the current stable image's kernel is `6.1.52-valve9-1-neptune-61`, whose source lives at https://steamdeck-packages.steamos.cloud/archlinux-mirror/sources/jupiter-3.5/linux-neptune-61-6.1.52.valve9-1.src.tar.gz.

This is a 2.9 GiB tarball. Why is it that big? Because there's an entire Linux Git tree in here.

```
$ tar xvf linux-neptune-61-6.1.52.valve9-1.src.tar.gz
linux-neptune-61/
linux-neptune-61/config
linux-neptune-61/config-neptune
linux-neptune-61/PKGBUILD
linux-neptune-61/archlinux-linux-neptune/
linux-neptune-61/.SRCINFO
linux-neptune-61/archlinux-linux-neptune/hooks/
linux-neptune-61/archlinux-linux-neptune/branches/
linux-neptune-61/archlinux-linux-neptune/HEAD
linux-neptune-61/archlinux-linux-neptune/config
linux-neptune-61/archlinux-linux-neptune/description
linux-neptune-61/archlinux-linux-neptune/objects/
linux-neptune-61/archlinux-linux-neptune/refs/
linux-neptune-61/archlinux-linux-neptune/info/
linux-neptune-61/archlinux-linux-neptune/packed-refs
linux-neptune-61/archlinux-linux-neptune/info/exclude
linux-neptune-61/archlinux-linux-neptune/refs/tags/
linux-neptune-61/archlinux-linux-neptune/refs/heads/
linux-neptune-61/archlinux-linux-neptune/objects/pack/
linux-neptune-61/archlinux-linux-neptune/objects/info/
linux-neptune-61/archlinux-linux-neptune/objects/pack/pack-6e0e2b73767937e4f217e55f6d3628af296eecfc.idx
linux-neptune-61/archlinux-linux-neptune/objects/pack/pack-6e0e2b73767937e4f217e55f6d3628af296eecfc.pack
linux-neptune-61/archlinux-linux-neptune/objects/pack/pack-6e0e2b73767937e4f217e55f6d3628af296eecfc.rev
...
```

This was likely generated by `makepkg --allsource` from a PKGBUILD with:

```
_tag=6.1.52-valve9
# ...
source=(
  "$_srcname::git+ssh://git@gitlab.steamos.cloud/jupiter/linux-integration.git#tag=$_tag"
  config          # Upstream Arch Linux kernel configuration file, DO NOT EDIT!!!
  config-neptune  # Jupiter: the neptune kernel fragment file (overrides 'config' above)
)
```

So we can't clone directly from their private GitLab repo or link to various commits, but we can get regular snapshots of every tag with full commit history in the repo from their `makepkg` sources. This is very useful for, say, bisecting which commit breaks suspend on your living room PC.

The source tarball isn't a working Git tree that you can `cd` into and start hacking on. It's a [bare repository](https://git-scm.com/docs/gitrepository-layout/2.22.0), which you can clone into a normal working tree[^worktree]. My recommendation is to maintain your own branch of changes, tag your releases, and push them to your favorite Git host so that you can use it in the PKGBUILD file. [Here's mine!](https://git.iliana.fyi/linux)

```
wget https://steamdeck-packages.steamos.cloud/archlinux-mirror/sources/jupiter-3.5/linux-neptune-61-6.1.52.valve9-1.src.tar.gz
tar xvzf linux-neptune-61-6.1.52.valve9-1.src.tar.gz
git clone linux-neptune-61/archlinux-linux-neptune/ linux-neptune
cd linux-neptune
git switch --create my-branch 6.1.52-valve9
```

[^worktree]: You could also use [git-worktree(1)](https://git-scm.com/docs/git-worktree) for this: `cd linux-neptune-61/archlinux-linux-neptune` then `git worktree add -B my-branch ../../linux-neptune 6.1.52-valve9`.

Fix up your PKGBUILD (pointing to your Git repo, not mine):

```diff
--- a/PKGBUILD
+++ b/PKGBUILD
@@ -3,5 +3,5 @@

 pkgbase=linux-neptune-61
-_tag=6.1.52-valve9
+_tag=6.1.52-valve9-iliana1
 pkgver=${_tag//-/.}
 pkgrel=1
@@ -19,5 +19,5 @@ options=('!strip' '!debug')
 _srcname=archlinux-linux-neptune
 source=(
-  "$_srcname::git+ssh://git@gitlab.steamos.cloud/jupiter/linux-integration.git#tag=$_tag"
+  "$_srcname::git+https://git.iliana.fyi/linux#tag=$_tag"
   config          # Upstream Arch Linux kernel configuration file, DO NOT EDIT!!!
   config-neptune  # Jupiter: the neptune kernel fragment file (overrides 'config' above)
```

Then `makepkg` should spit out a package. (Tip: `makepkg MAKEFLAGS=-j$(nproc)`, or updating `/etc/makepkg.conf`, is a good idea if you are not building in a tiny virtual machine.) This same general process should apply for any SteamOS-specific packages; all the ones I've looked at similarly use a Git repository as their first source.

To make the next steps easier, I set up a pacman repo containing my package outputs. This also helps the `steamos-devmode` tool work properly if you choose to run that in the future. This is [very simple](https://archlinux.org/pacman/repo-add.8.html): put the packages in a directory, run `repo-add $REPO_NAME.db.tar.zst [PACKAGES...]` in that directory, and upload the directory to a web host somewhere.

## Repacking the root filesystem

The update client is perfectly-readable Python, and the sources for the rest of the packages on the system can be found adjacent to Valve's pacman repos, but I haven't yet found any release engineering scripts. Reverse engineering these would be fraught, time-consuming, and beyond what I believe my attention span would allow, so I decided to take the existing root filesystem and "repack" it to fit my needs.

If you want my scripts without the explanations and commentary, you can find them at https://git.iliana.fyi/fauxlo/tree/.

### Getting the root filesystem

<ili-callout>

The normal way to get a copy of the SteamOS root filesystem image is to buy a Steam Deck or download the recovery image from https://store.steampowered.com/steamos/download?ver=steamdeck, both of which require agreeing to the Steam End User License Agreement[^agreement]. The methods I describe below don't make you do this, but now you're aware of it.

[^agreement]: If anyone from Valve is reading this, you might want to update your EULA to point to somewhere more useful than https://gitlab.steamos.cloud/, which has barely any public repositories and certainly does not have a "list of contained packages along with their respective FOSS or proprietary licenses as well as source code for FOSS packages".

</ili-callout>

First, we need the root filesystem. You could install SteamOS, run an update, and pull it off the disk, but that is kind of obnoxious, especially if you don't have any hardware to install it on.

Every build of a Steam Deck image can be found at https://steamdeck-images.steamos.cloud/steamdeck/, but to find the current release version you can look at what appears to be a fallback URL for the updates system, https://steamdeck-atomupd.steamos.cloud/meta/steamos/amd64/snapshot/steamdeck.json (or [this path for the preview channel](https://steamdeck-atomupd.steamos.cloud/meta/steamos/amd64/snapshot/steamdeck-beta.json)). As of writing, the current stable version is https://steamdeck-images.steamos.cloud/steamdeck/20231122.1/.

To download the root filesystem, we follow the same steps `steamos-atomupd-client` does: first, download the RAUC bundle (the `.raucb` file). Then extract the `rootfs.img.caibx` from inside; these RAUC bundles are SquashFS filesystems with a signature at the end, so you can either mount it or use unsquashfs (from squashfs-tools) or p7zip to extract it without mounting. Finally, use casync to fetch the image using the `.castr` store adjacent to the `.raucb` bundle:

```
casync extract \
	--store=https://steamdeck-images.steamos.cloud/steamdeck/20231122.1/steamdeck-20231122.1-3.5.7.castr \
	rootfs.img.caibx rootfs.img
```

The casync store URL is the RAUC bundle URL, but with `.raucb` replaced with `.castr` (this is hardcoded in `steamos-atomupd`).

[Here is a script I use to do all this.](https://git.iliana.fyi/fauxlo/tree/fetch-current.sh?id=c50eb80f23c08f1ffc824d4983d5b9a740fb1273)

<ili-tangent>

The adjacent `.img.zip` and `.img.zst` files are not the root filesystem, sadly, but are separate bootable recovery images:

```
$ sgdisk --print disk.img
Disk disk.img: 15125000 sectors, 7.2 GiB
[...]

Number  Start (sector)    End (sector)  Size       Code  Name
   1              34          131071   64.0 MiB    EF00  esp
   2          131072          393215   128.0 MiB   0700  efi-A
   3          655360        11141119   5.0 GiB     8304  rootfs-A
   4        11141120        11665407   256.0 MiB   8310  var-A
   5        11665408        15124966   1.6 GiB     8302  home
```

You could extract the rootfs partition and use it in the next steps, but for some reason it's not a bit-for-bit copy of the image that is downloaded via RAUC and casync, and doing this doesn't save you from having to use those tools as we need them to turn our repacked image back into an update bundle.

</ili-tangent>

### Mounting the root filesystem

First, we should randomize the filesystem UUID. If you update from a currently-released SteamOS image to your customized one without randomizing the filesystem UUID, you will end up with two distinct filesystems with the same UUID. This can cause problems.

```
btrfstune -fu rootfs.img
```

Valve is currently using Btrfs images with zstd compression, so to maintain that compression as we change the image, we need to mount it with the appropriate option:

```
mkdir rootfs
mount -o compress=zstd rootfs.img rootfs
```

SteamOS uses Btrfs's `readonly` subvolume property; clear that flag:

```
btrfs property set -ts rootfs ro false
```

Modifying certain packages, such as the Linux kernel, triggers scripts that want /dev and /proc, so mount those:

```
mount -t devtmpfs dev rootfs/dev
mount -t proc proc rootfs/proc
```

It's also a good idea to prevent writes to directories that will be mounted by the booted system. We can mount tmpfs to these directories:

```
mount -t tmpfs tmpfs rootfs/tmp
mount -t tmpfs -o mode=755 tmpfs rootfs/run
mount -t tmpfs -o mode=755 tmpfs rootfs/var
mount -t tmpfs -o mode=755 tmpfs rootfs/home
```

In this example we'll be installing packages via pacman repositories in a chroot (using pacman's `--sysroot` option). Networking functions fine in a chroot, but name resolution still relies on a correct /etc/resolv.conf, so bind mount one in:

```
mount --bind "$(realpath /etc/resolv.conf)" rootfs/etc/resolv.conf
```

### Replacing packages

To add your custom repository, make it the first repository entry in `/etc/pacman.conf`. This will ensure your packages override any newer-versioned ones from Valve's repositories. It also allows your packages to be reinstalled by `steamos-devmode` if you run that on this image. I used this stanza:

```
[fauxlo]
Server = https://fauxlo.ili.fyi/pacman/$arch
SigLevel = Never
```

`SigLevel = Never` allows the packages to have no signatures. If you want to GPG-sign your packages, go for it, but that's beyond what I have patience for.

<ili-tangent>

If you do end up installing GPG-signed packages, you'll need to populate the pacman keyring. I think it's best to avoid messing with the empty keyring in `/etc/pacman.d/gnupg` by populating a new keyring on a tmpfs:

```
chroot rootfs pacman-key --gpgdir /tmp/gnupg --init
chroot rootfs pacman-key --gpgdir /tmp/gnupg --populate
# These start a gpg-agent, which we need to stop before we can unmount at the end.
chroot rootfs gpgconf --homedir /tmp/gnupg --kill all
```

Then add `--gpgdir /tmp/gnupg` to your pacman incantation.

</ili-tangent>

Then, we install:

```
pacman --sysroot rootfs --noconfirm -Sy linux-neptune-61
```

<ili-tangent>

In my script, I avoid using `-y` and instead synchronize my repository's database behind pacman's back before running the install command:

```
curl -Ro rootfs/usr/lib/holo/pacmandb/sync/fauxlo.db \
	https://fauxlo.ili.fyi/pacman/x86_64/fauxlo.db
```

This keeps the state of the other repositories on disk frozen at the same point in time when the image was originally built. I don't think this actually matters, but it reduces the changes that show up if I diff my image against Valve's.

</ili-tangent>

### Changing the build ID

`steamos-atomupd` reads from `/lib/steamos-atomupd/manifest.json`, or if that is somehow missing, `/etc/os-release`, to determine the version and build ID of the current image. It will refuse to perform an update if the server says the available update's build ID is the same as the current image. It's also good to know what image you're running.

The build ID _must_ be of the form YYYYMMDD.N. If it isn't, `steamos-atomupd` exits with a Python traceback upon encountering it. To avoid having to remember to count up manually, I set N to a timestamp; either HHMMSS or a Unix timestamp would work fine.

Update the `buildid` field in `rootfs/lib/steamos-atomupd/manifest.json` and the `BUILD_ID` field in `rootfs/etc/os-release` with whatever you pick. You can steal from [the Bash script I wrote to do this](https://git.iliana.fyi/fauxlo/tree/repack.sh?id=c50eb80f23c08f1ffc824d4983d5b9a740fb1273#n47).

```diff
--- a/lib/steamos-atomupd/manifest.json
+++ b/lib/steamos-atomupd/manifest.json
@@ -4,7 +4,7 @@
   "variant": "steamdeck",
   "arch": "amd64",
   "version": "3.5.7",
-  "buildid": "20231122.1",
+  "buildid": "20231219.55534",
   "checkpoint": false,
   "estimated_size": 0
 }
--- a/etc/os-release
+++ b/etc/os-release
@@ -11,4 +11,4 @@
 LOGO=steamos
 VARIANT_ID=steamdeck
 VERSION_ID=3.5.7
-BUILD_ID=20231122.1
+BUILD_ID=20231219.55534
```

Keep a copy of the updated `manifest.json` handy, as it's useful in building the updates server later.

### Changing the update URLs and signing keys

RAUC uses X.509 certificates to establish trust. The trusted certificate lives at `/etc/rauc/keyring.pem`. You can make an overcomplicated PKI scheme, such as the [one generated in RAUC's tests](https://github.com/rauc/rauc/blob/master/test/openssl-ca-create.sh), but [a simple self-signed certificate](https://rauc.readthedocs.io/en/latest/examples.html#pki-setup) is fine. Install your new certificate at `rootfs/etc/rauc/keyring.pem`.

You'll need to modify the URLs in `rootfs/etc/steamos-atomupd/client.conf` with your own:

```diff
--- a/rootfs/etc/steamos-atomupd/client.conf
+++ b/rootfs/etc/steamos-atomupd/client.conf
@@ -1,5 +1,5 @@
 [Server]
-QueryUrl = https://steamdeck-atomupd.steamos.cloud/updates
-ImagesUrl = https://steamdeck-images.steamos.cloud/
-MetaUrl = https://steamdeck-atomupd.steamos.cloud/meta
+QueryUrl = https://fauxlo.ili.fyi/updates
+ImagesUrl = https://fauxlo.ili.fyi/
+MetaUrl = https://fauxlo.ili.fyi/meta
 Variants = rel;rc;beta;bc;main
```

### Other changes

You can make pretty much any change you want at this point as long as you don't run out of space in a 5 GiB Btrfs image. For instance, if you want your SteamOS device to be resolvable as `hostname.local` on your network, you could remove `rootfs/usr/lib/systemd/resolved.conf.d/00-disable-mdns.conf`. This _can_ be overridden with a configuration in the `/etc` overlay, but it's kind of a pain in the ass.

In general, my philosophy here is that you should avoid making changes that are trivial to perform without modifying the image. You _could_ install Firefox in the root filesystem this way, instead of using Flatpak or Nix, but then you'd need to repack the image every time you want to install a Firefox security update.

### Unmounting the root filesystem

Mark the filesystem read-only once again:

```
btrfs property set -ts rootfs ro true
```

Discard any unused blocks:

```
fstrim -v rootfs
```

Then, unmount. `--recursive` is particularly helpful here to take care of all the pseudo-filesystems we mounted in:

```
umount --recursive rootfs
```

## Creating the RAUC bundle

First we need to create the casync store and blob index. We can do this with:

```
mkdir bundle
casync make --store=rootfs.img.castr \
	bundle/rootfs.img.caibx rootfs.img
```

The RAUC bundle needs two other files. The first is `manifest.raucm`:

```sh
cat >bundle/manifest.raucm <<EOF
[update]
compatible=steamos-amd64
version=$version

[image.rootfs]
sha256=$(sha256sum rootfs.img | awk '{ print $1 }')
size=$(stat -c %s rootfs.img)
filename=rootfs.img.caibx
EOF
```

The second is a `UUID` file containing the filesystem UUID:

```
blkid -s UUID -o value rootfs.img >bundle/UUID
```

With those three files:

```
$ ls bundle
manifest.raucm  rootfs.img.caibx  UUID
```

we can now call `rauc bundle`:

```
rauc bundle \
	--signing-keyring=cert.pem --cert=cert.pem --key=key.pem \
	bundle rootfs.img.raucb
```

Upload `rootfs.img.raucb` and `rootfs.img.caibx` to the web server specified by `ImagesUrl` in `rootfs/etc/steamos-atomupd/client.conf`. These need to be in the same directory.

## Final update server setup

The web server you used for `QueryUrl` and `MetaUrl` in `rootfs/etc/steamos-atomupd/client.conf` will need to serve a JSON file. This doesn't need to be fancy; what I do is write a `live.json` file with these contents:

```json
{
  "minor": {
    "release": "holo",
    "candidates": [
      {
        "image": {
          "product": "steamos",
          "release": "holo",
          "variant": "steamdeck",
          "arch": "amd64",
          "version": "3.5.7",
          "buildid": "20231219.55534",
          "checkpoint": false,
          "estimated_size": 0
        },
        "update_path": "rootfs.img.raucb"
      }
    ]
  }
}
```

Note that the object at `.minor.candidates[0].image` should be the same as `/lib/steamos-atomupd/manifest.json` in your image. `update_path` is what the updates client will append to your `ImagesUrl` to download the bundle.

I use the following Caddy configuration to rewrite the requests `steamos-atomupd` makes to `QueryUrl` and `MetaUrl` to the above `live.json`:

```
root * /var/www/fauxlo.ili.fyi
rewrite /updates /live.json
rewrite /meta/*/*/*/*.json /live.json
rewrite /meta/*/*/*/*/*.json /live.json
file_server browse
```

The real SteamOS `QueryUrl` and `MetaUrl` seem to have quite a bit more logic to them, but this is sufficient to get `steamos-atomupd` to find the new update. It has logic to avoid updating if it's already running the image advertised as currently available.

## Updating!

Once you have all this in place, you can update an existing SteamOS installation to this by modifying `/etc/rauc/keyring.pem` and `/etc/steamos-atomupd/client.conf`. (No `steamos-readonly disable` required, as your changes will land on the `/etc` overlay; after you run `steamos-update`, consider cleaning those changes out of `/var/lib/overlays/etc/upper`.)

You can also probably install your modified SteamOS by modifying one of Valve's recovery images, replacing their rootfs with your own. I haven't tested this, but I also haven't seen anything that would contradict this.

<ili-callout>

Thanks for reading! 2023 has been a busier-than-usual year for my blog, and I'm pretty happy about getting more writing out there. If you've found any of my blog posts helpful, give a trans person all of your money. See you next year!

</ili-callout>
