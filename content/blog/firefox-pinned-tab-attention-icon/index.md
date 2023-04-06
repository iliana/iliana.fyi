---
title: "Disabling the “title changed” light on Firefox pinned tabs"
date: 2023-04-06T12:00:00-07:00
---

Webmail and chat clients often change the page title to tell you if you have unread messages and get your attention. If you pin these tabs in Firefox, the page title is hidden. To ensure pages can still get your attention, Firefox displays a little light under the favicon when the title changes. It looks like this:[^contrast]

[^contrast]: I'm using Firefox on macOS with "Increase contrast" enabled, so the light is (unfortunately for me) brighter.

![](tab-titlechanged.png)

As part of an ongoing project to manage my ADHD, I wanted to disable these. Unfortunately Firefox provides no `about:config` option to do that. But at least userChrome.css is still supported.

Here are some steps to create a userChrome.css file:

1. Set **toolkit.legacyUserProfileCustomizations.stylesheets** to **true** in about:config.
2. Find your profile folder on about:support.
3. Navigate to this folder and create a **chrome** folder inside it, if it doesn't exist.
4. Create a file named **userChrome.css**.

Once you have a userChrome.css file[^namespace], you can put this in it:

```css
:root {
  --lwt-tab-attention-icon-color: transparent;
}
```

[^namespace]: Note that this will not work if you have `@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);` in your userChrome.css, because this rule affects browser styles created via HTML. [There is no XUL, only HTML.](http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul)

Restart Firefox, and never see the tab light again.

There are several ways to do this; I chose this way because it sets a CSS variable that can be set by browser themes to override the tab color, which seems less fragile than ever-changing selectors. If this doesn't work for you, you can [try the selector-based approach](https://support.mozilla.org/en-US/questions/1181537) (this approach lets you disable it based on other inputs as well, such as the tab title). You can find [the relevant CSS in the Firefox source tree](https://hg.mozilla.org/mozilla-central/file/tip/browser/themes/shared/tabs.css).
