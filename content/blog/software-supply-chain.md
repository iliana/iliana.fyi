---
title: "There is no “software supply chain”"
date: 2022-09-19T12:00:00-07:00
---

In actual supply chains, money is changing hands. A server manufacturer is paying for PCB fabrication, who is paying their suppliers for raw materials and equipment, and so on until the whole thing eventually loops back on itself when a mining company needs to buy a server.

When you take on an additional dependency in a software project, often money does not change hands. `npm install` and `cargo add` do not bill your credit card. There is no formal agreement between a maintainer and its downstream users.

There is a lot of attention on securing "software supply chains." The usual approach is that you want to try to avoid security issues in your underlying components from impacting customers of your product; and when they do, you want to be able to respond quickly to fix the issue. The people who care about this class of problem are often software companies. The class of components that are most concerning these companies are ones where unpaid hobbyist maintainers wrote something for themselves with no maintenance plan.

This is where the supply chain metaphor -- and it is just that, a _metaphor_ -- breaks down. If a microchip vendor enters an agreement and fails to uphold it, the vendor's customers have recourse. If an open source maintainer leaves a project unmaintained for whatever reason, that's not the maintainer's fault, and the companies that relied on their work are the ones who get to solve their problems in the future. Using the term "supply chain" here dehumanizes the labor involved in developing and maintaining software as a _hobby_.

Everything that can be said about sponsorship and paying maintainers has already been said. Important work is still unfunded. Some of us, including me, don't particularly mind that we're not making money off of our weekend hacks. The problem is when the mere act of publishing software becomes a burden.

You still cannot disable pull requests on a GitHub repository. [A package repository might deem your software "critical"](https://lwn.net/Articles/900953/), adding requirements to publishing updates that you might not want to or be able to comply with. [Google even wanted to disallow anonymous individuals from maintaining critical software and wanted to police the identities of others.](https://security.googleblog.com/2021/02/know-prevent-fix-framework-for-shifting.html)[^wanted]

[^wanted]: “... our view is that owners and maintainers of critical software must not be anonymous” ... “To continue the inclusive nature of open source, we need to be able to trust a wide range of identities, but still with verified integrity. This implies a federated model for identities, perhaps similar to how we support federated SSL certificates today ...”. (I write "wanted" because it's been 18 months since this post, and I'm not aware of a more current statement either re-affirming or softening this position, so I'm giving Google the benefit of the doubt it does not deserve.)

Or, perhaps a maintainer tells someone that they won't maintain a project anymore, and [GitHub notifies thousands of dependent repositories](https://github.com/advisories/GHSA-74w3-p89x-ffgh), calling it a "critical severity" advisory.[^critical] This was obviously a mistake, and GitHub withdrew and re-labeled it as low severity this morning, but it is far from the only time systems built to secure the "software supply chain" have failed to understand the nuances of open source software maintenance.

[^critical]: Here is a [Google cache copy of when it was labeled critical](https://perma.cc/N6XX-G5PE).

I just want to publish software that I think is neat so that other hobbyists can use and learn from it, and I otherwise want to be left the hell alone. I should be allowed to decide if something I wrote is "done". The focus on securing the "software supply chain" has made it even more likely that releasing software for others to use will just mean more work for me that I don't benefit from. I reject the idea that a concept so tenuous can be secured in the first place.
