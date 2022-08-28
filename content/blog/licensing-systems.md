---
title: An archeaological dive through a software copyright concern
date: 2022-08-22T12:00:00-08:00
---

My friend [Artemis](https://artemis.sh) wrote about [unlicensed code finding its way into Linux distributions](https://artemis.sh/2022/08/21/this-program-is-illegally-packaged-in-14-distributions.html). How did this happen? Let's do a little bit of software archaeology[^archaeology].

[^archaeology]: Wikipedia [defines software archaeology](https://en.wikipedia.org/wiki/Software_archaeology) as "the study of poorly documented or undocumented legacy software implementations, as part of software maintenance." I do not like this definition; we can study all software, including well-documented and modern software, to study the inner workings of computer systems and the intentions of its authors.

The [unlicensed code in question](https://github.com/seletskiy/godiff)[^original] is a Go library for parsing unified diffs. [`tea`](https://gitea.com/gitea/tea), "the official CLI for Gitea", uses this library to allow users to [review pull requests from the command line](https://gitea.com/gitea/tea/pulls/315). The feature was merged into `tea` at the end of 2020; the most recent commit to the library's original repository is from 2016. [An issue from someone who is likely the `tea` feature's author asking for license clarification](https://github.com/seletskiy/godiff/issues/4) has gone unanswered.

[^original]: This is the original source; `tea` uses [this fork with a number of changes](https://gitea.com/noerw/unidiff-comments).

We'll discuss some background information, look at where various systems succeeded and failed, and finally ask whether any of this matters.

<ili-tangent>

This parser appears to be unique (among the Go ecosystem) in that it can parse inline comments, like this:

```diff
diff --git a/nexus/src/external_api/console_api.rs b/nexus/src/external_api/console_api.rs
index 1d1fa18c..119b19ea 100644
--- a/nexus/src/external_api/console_api.rs
+++ b/nexus/src/external_api/console_api.rs
@@ -586,7 +586,13 @@ pub async fn console_index_or_login_redirect(
     // otherwise redirect to idp

     // put the current URI in the query string to redirect back to after login
-    let uri = rqctx.request.lock().await.uri().to_string();
+    let uri = rqctx
+        .request
+        .lock()
+        .await
+        .uri()
+        .path_and_query()
+        .map(|p| p.to_string());
# Can you explain why this is necessary in your commit message?

     Ok(Response::builder()
         .status(StatusCode::FOUND)
```

I had _no idea_ this was a thing, but this is the sort of thing `tea` needs to enable posting code reviews from the comfort of your terminal, which is pretty neat. I am surprised this is the workflow you might reach for, what with Git being built for LKML-style email workflows:

```
On Aug 19, 2022 at 14:10, iliana etaoin <iliana@oxide.computer> wrote:
> -    let uri = rqctx.request.lock().await.uri().to_string();
> +    let uri = rqctx
> +        .request
> +        .lock()
> +        .await
> +        .uri()
> +        .path_and_query()
> +        .map(|p| p.to_string());

Can you explain why this is necessary in your commit message?
```

But that's designed<sup>[_citation needed_]</sup> for humans to parse, not computers, so I get why you might want to use this.

</ili-tangent>

## Why do we care about licensing?

In [most countries](https://en.wikipedia.org/wiki/Berne_Convention), works are automatically copyrighted, and there are minimum standards for exclusive rights the author of that work retains. As someone living in a party to the Berne Convention, this blog post I wrote is automatically copyrighted, despite there being no notice informing you of this.

After making the logical leap necessary to apply those minimum standards to the software world, we can understand that software, by default, probably cannot be used, modified, or redistributed without a _license_ from the copyright holder. There is significant case law on the copyrightability of software that we are _not_ going to read, and there are a lot of open questions that we are _not_ going to try to answer, but most of the important open questions have been solved: if you want to use someone's software, you need a license, and if you want others to be able to use your software without asking permission, you need to grant a license.

<ili-tangent>

If you push code to a public GitHub repository, [you grant an implicit, limited license described in the Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#3-ownership-of-content-right-to-post-and-license-grants), which allows GitHub to distribute your code and for other users to do a limited set of actions with it. This license is very limited, and does not grant the usual things lawyers want to see when asked about usage and redistribution of software.

<ili-tangent>

Although maybe that limited license is [not as limited as we thought](https://lwn.net/Articles/862769/).

</ili-tangent>

</ili-tangent>

The usual expectation is that you are publishing a copy of your software so that others can use it, but this is not necessarily true; licenses make that explicit. Some licenses, such as [the MIT License](https://en.wikipedia.org/wiki/MIT_License), permit damn near everything as long as you include a notice from the copyright holder; some require more significant responsibility, such as [the AGPL](https://en.wikipedia.org/wiki/Affero_General_Public_License), which requires that you provide a copy of the software to anyone who can access it over a network[^agpl]; some are [purposefully restrictive](https://anticapitalist.software/), or [desperately trying to keep megacorporations from destroying their business](https://en.wikipedia.org/wiki/Server_Side_Public_License), or [are jokes purporting to be a legal document](https://github.com/supertunaman/cdl/blob/master/COPYING).

[^agpl]: The AGPL is [arguably impossible to comply with](https://twitter.com/ilianathewitch/status/1511768411772137477) unless authors go out of their way to make compliance the default, but pretty much all corporations refuse to touch AGPL-licensed code, so, it;s impossible to say if its bad or not,

The short version: you can't really use software without someone giving you permission, and there are lots of widely-accepted ways to give people permission to use your software.

<ili-tangent>

I must also bring up [boringcactus's Anti-License Manifesto](https://www.boringcactus.com/2021/09/29/anti-license-manifesto.html), which I wholeheartedly agree with:

> software licenses are unavoidably a legal tool. the legal system, in the US and approximately everywhere else, is not a machine that leads to justice. therefore, software licenses do not lead to justice.
>
> we cannot software license our way to a better world. as such, we should and must software license our way to a stranger world. permissive licenses and copyleft licenses are both tools of the corporate status quo. we therefore reject all conventional software licenses, and instead champion the weird, the experimental, the decorative, the hostile, the absurd, the useless, the straight up unhinged.

</ili-tangent>

## What does a Linux distribution do, exactly?

A Linux distribution distributes Linux, which is software. As a side effect, Linux distributions[^homebrew] usually also distribute additional software that is compatible with Linux, so you can check that your copy of Linux is working correctly, and also so you can make use of it at all.

[^homebrew]: I'm referring to Linux distributions a lot here, but packaging ecosystems like [pkgsrc](https://www.pkgsrc.org/), [Homebrew](https://brew.sh), and [Chocolatey](https://chocolatey.org) ultimately share the same problem space while targeting a system that somebody _else_ is building.

The groups of people who build and maintain Linux distributions have many goals, but they usually boil down to two things:

1. Ensure that they are allowed to distribute the software contained in the distribution.
2. Ensure that their users are allowed to distribute the software, too.

And so, being a Linux distribution maintainer involves a _lot_ of reading software licenses and asking lawyers about them, if you're lucky enough to have lawyers. The bureaucracy of Linux distros is overwhelming, and requires [writing policy manuals](https://www.debian.org/doc/debian-policy/), [providing legal guidelines](https://docs.fedoraproject.org/en-US/legal/), and [building automation](https://github.com/bottlerocket-os/bottlerocket-sdk/tree/develop/license-scan) to make what is usually a volunteer-driven system work at all (and licensing is somehow one of the least complex topics in distribution development).

<ili-tangent>

Remember our earlier tangent about [anti-licenses](https://www.boringcactus.com/2021/09/29/anti-license-manifesto.html)? Linux distributions usually wish to avoid preventing the corporate status quo from being unable to use parts of their distros, and as a policy disallow these sorts of licenses. After all, many of the most popular Linux distributions are _built by_ the corporate status quo.

</ili-tangent>

## Rigid systems are resistant to change

Go and other languages[^rust] that statically compile dependencies prove to be difficult for many Linux distributions. A lot of distribution maintainers suggest that [static linking creates security issues down the road](https://blogs.gentoo.org/mgorny/2021/02/19/the-modern-packagers-security-nightmare/), but this is really a tertiary problem; the explosive dependency trees, including using multiple versions of the same package at once, break the assumptions that Linux distributions made in past eras[^compat]. Perl and Python packaging are difficult, and the npm, Go, and Rust ecosystems exacerbate the fragility of Linux distribution infrastructure even further.

[^rust]: Yes, this includes Rust.
[^compat]: Except... were those even good assumptions? I've spent far too many days of my life building packages to keep binaries that linked against older shared libraries.

It is becoming more difficult each day to keep an eye on the license of every single piece of software that gets slurped into a distribution. Automation helps, but is expensive to write and maintain, and every ecosystem is subtly different with so, so many exceptions to the rules. For more popular distributions (such as Debian and Fedora) that ultimately feed into ecosystems that are sold to customers (such as Ubuntu and RHEL), policies and guidelines help, but other distributions might not have (or want!) the procedures necessary to ensure what they ship is properly licensed.

<ili-tangent>

Another thing that makes statically-compiled languages difficult: attribution. Linux packagers tend to distribute the original license information with the package; many licenses require attribution or notice of some kind, and it's easiest to just ship every license with the software than figure out which ones you actually need to ship. But if you install, say, `ripgrep`[^ripgrep] or `docker`, you aren't installing the dozens of dependency packages, because they're just source code you don't need. You're also not installing the attribution notices for those dependencies, which you also don't need, but are often required to be distributed with copies of the software. Oops.

[^ripgrep]: ripgrep depends on both `atty` and `strsim`, libraries that [are](https://github.com/softprops/atty/blob/6633c0e1446aa19e6cd00e00e39770da43081bda/LICENSE) [licensed](https://github.com/dguo/strsim-rs/blob/65eac453cbd10ba4e13273002c843e95c81ae93f/LICENSE) only under the MIT License, which requires the _copyright notice_ (the part with someone's name in it) is included in all copies of the software; their copyright notices are nowhere to be found on my Debian system with ripgrep installed. (I'm not picking on ripgrep arbitrarily; it just happens to be the single static-binary-ecosystem case I'm aware of that's installed on all my systems.)

</ili-tangent>

So. Where did these systems succeed?

- Someone wanted to use some unlicensed software, and [asked the authors](https://github.com/seletskiy/godiff/issues/4) to clarify a license.
- [Someone trying to package software for a distribution](https://artemis.sh/2022/08/21/this-program-is-illegally-packaged-in-14-distributions.html) found the licensing problem.

Where did they fail?

- The person who wanted to use some unlicensed software used it anyway after the authors didn't respond.
- Maintainers of `tea` did not check or inquire about the licensing issue (but I'm not really sure if that's their responsibility).
- Packagers and maintainers for [several distributions](https://repology.org/project/gitea-tea/versions) did not catch the problem, likely for a lack of tools or advice to check licenses of dependencies.
- Even when dependencies are licensed, attributions or notices required by the license aren't always distributed with the final binary artifacts.
- I wrote this blog post instead of filing any issues with Gitea or the distributions that ship `tea`. (It sounds like a lot of work.)

## Does any of this actually matter?

No.

Think about it. All of the [distributors of this code tracked in Repology](https://repology.org/project/gitea-tea/versions) are community-operated, as is the Gitea project; the risk-reward ratio of theoretical copyright litigation is not good, especially when [litigating against open source projects tends to paint a target on your back](https://blog.opensource.org/gnome-patent-troll-stripped-of-patent-rights/).

The larger distros with a focus on making redistribution painless are not shipping this code -- not for any license auditing reasons, as far as I can tell; just that packaging is hard, there's a lot of software, and not a lot of people who care to do the work.

Distros can mitigate the issue by removing the code review functionality from the CLI. Anybody could take a better-licensed unified diff parser and add comment support to replace the unlicensed code. Or nothing could happen at all, and it would probably be fine.

<ili-callout>

_If you liked this writing, you can support me writing more things through [my GitHub Sponsors page](https://github.com/sponsors/iliana). Thanks for your consideration!_

</ili-callout>
