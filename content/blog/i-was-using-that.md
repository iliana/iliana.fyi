---
title: "Hey, I was using that..."
date: 2023-06-13T12:00:00-07:00
---

A couple of months ago [I blogged about how to stop Firefox pinned tabs from lighting up on title change](https://iliana.fyi/blog/firefox-pinned-tab-attention-icon/). Today, I had to update that to use the following userChrome.css:

```css
.tab-stack > .tab-content[pinned][titlechanged] {
  background-image: none !important;
}
```

instead of this now-broken userChrome.css:

```css
/* this doesn't work anymore :( */
:root {
  --lwt-tab-attention-icon-color: transparent;
}
```

When I restarted Firefox today, it updated to version 114, and I immediately noticed that my old CSS had failed me. A quick dig into mozilla-central revealed that they removed[^1] `--lwt-tab-attention-icon-color` because it "was added for colorways and won't be needed going forward".[^2]

[^1]: The commit landed two weeks after my blog post, but the bug has been open since February. This is comforting to the part of my brain that briefly believed someone read my blog post and decided to break my workflow.
[^2]: I am not linking the bug because I don't want an extremely trivial route for people reading this blog to go add unwanted noise to the bug tracker. That's not helpful to anyone.

This is, of course, frustrating. It's frustrating because I dug through the CSS to find this, which I believed to be "less fragile than ever-changing selectors", hilariously enough. It's frustrating that Firefox developers spent however much time on Colorways for it to be [axed earlier this year](https://support.mozilla.org/en-US/kb/personalize-firefox-colorways). Most of all, I think it's frustrating that userChrome.css is the only path I have to make this browser work for my needs.

There's no preference, or even a hidden `about:config` toggle, to turn off the title changed light; this would be good to have for improved [cognitive accessibility](https://www.boia.org/blog/what-is-cognitive-accessibility). There's no way for an addon to change this behavior, because that died with XUL. I know I'm not the only one who needs this.[^3]

[^3]: If I had more time, I would have written ~~a shorter letter~~ a well-written bug report that won't get prioritized, or a patch that takes dozens of hours for me to get a build environment set up for, test, iterate on, and get feedback for.

At the very least, Firefox at least lets me dig into the internals and _fix this_ for myself without having to build my own copy of Firefox every week. That's certainly better than [some browsers](https://superuser.com/questions/1684707/how-to-enable-one-line-ui-on-chromium-based-browsers). But was it really necessary to remove what looked like a much better way to override this behavior?
