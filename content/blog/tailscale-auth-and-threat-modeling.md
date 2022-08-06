---
title: "Tailscale’s human-scale networks are still controlled by Google and Microsoft"
date: 2022-04-04T12:00:00-07:00
---

I'm not sure if they realize it yet, but Tailscale seems to work extremely well for polycules. Each user can have their own single-user [Tailnet][tailnet] and [explicitly share specific machines][sharing] with other people. Both parties have to consent to sharing a device; either party can revoke this consent. The device owner can further restrict accessible ports through [ACLs][acls]. Tailscale runs on [pretty][netbsd] [much][illumos] anything if you try hard and believe in yourself. This entire use case, up to this point, fits in Tailscale's free tier.

As an apparent product decision, Tailscale does not store passwords or manage 2FA. It relies on third-party authentication services; at the free tier, this is restricted to Google, Microsoft, and GitHub (a Microsoft subsidiary). If you want 2FA, you enable 2FA on your account with those providers or enforce it in your organization.

This is in line with Tailscale's goal of [keeping operational costs as low as possible by design][free]; today, Tailscale-the-company does not handle or store any information that could be used to gain access to your account (apart from API keys) or decrypt data going over your Tailnet. Instead of constantly auditing that their storage of user credentials is good enough for their largest customers, they simply do not store credentials and tick the box on the audit report.

Our polycule does a lot of threat modeling. We don't push a lot of paperwork around, but we do constantly consider some important threats around the systems we use to keep connected:

1. Is there a threat of information disclosure to an unknown third party (e.g. eavesdropping, rogue sysadmin, APT) or a _known_ third party (e.g. someone you had a bad breakup with)?
2. Is there a threat of identity impersonation (e.g. someone is able to send messages as you)?
3. Is there a threat of losing access to your connections due to a third party for an unrelated reason (e.g. feature change, identity change[^username], account closure, service downtime)?

[^username]: It's unclear what happens to your Tailnet if you change your email or username with the identity provider, since Tailscale appears to make this a one-to-one mapping to your Tailnet. [Identity is a fraught topic for trans people and plural systems](https://christine.website/blog/identity-model-software-2021-01-31), whether these users are on the free tier or an enterprise account.

And, unfortunately, _requiring_ the use of authentication systems owned by Google and Microsoft invoke _all_ of these threats and more[^ice], but most concerning is the third: all of these services can terminate your account for pretty much any reason, and it is [apparently very easy to violate the GitHub Terms of Service on accident][e98e]. If you lose access to the account for your Tailnet, you eventually lose access to your machines and machines shared with you (probably not immediately, but you can no longer log in to manage your machines, and API keys last at most for 90 days).

[^ice]: Both of these companies [still have contracts with ICE](https://www.businessinsider.com/google-amazon-microsoft-ice-cbp-third-party-contracts-cloud-2021-10) and are regularly involved in union-busting, so these are somewhat concerning companies to force your free-tier customers to use.

Corporate users of Tailscale pay a company to handle their <abbr title="identity provider">IdP</abbr>. Our loose amalgamation of people cannot and will not (and Tailscale, rightfully so, wants you to pay them to integrate a custom IdP into their systems). But if Tailscale is meant to support "[human-scale networks][ts-about]," why is this threat so apparent in their product?

There's not really a good option here for Tailscale. Even if you could bring your own IdP as a free-tier customer, you still have to apply this same threat modeling to that particular provider, even if you know the people who run it, and would put you in the same Tailnet as everyone else in your IdP, replacing the feature of _explicitly_ sharing individual machines with the need for network admins to manage this sharing for the users. It'd be nice if they supported a username/password/2FA flow without the need for third parties, but this is expensive to implement correctly.

I just want to have a single-user Tailnet and explicitly share machines with my partners, without having to trust that GitHub won't ban me tomorrow. I wish that wasn't too much to ask of even the paid Personal Pro plan.

[tailnet]: https://tailscale.com/kb/1136/tailnet/
[sharing]: https://tailscale.com/kb/1084/sharing/
[acls]: https://tailscale.com/kb/1018/acls/
[netbsd]: https://artemis.sh/2022/02/16/tailscale-on-netbsd-proof-of-concept.html
[illumos]: https://blog.shalman.org/tailscale-for-illumos/
[free]: https://tailscale.com/blog/free-plan/
[e98e]: /blog/everything-that-lives-is-designed-to-end/
[ts-about]: https://tailscale.com/company/
