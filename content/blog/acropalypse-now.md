---
title: "The undocumented Android change that led to aCropalypse was reported during the beta"
date: 2023-03-18T12:00:00-07:00
---

[Exploiting aCropalypse: Recovering Truncated PNGs](https://www.da.vidbuchanan.co.uk/blog/exploiting-acropalypse.html) (CVE-2023-21036):

> The bug lies in closed-source Google-proprietary code so it's a bit hard to inspect, but after some patch-diffing I concluded that the root cause was due to this horrible bit of API 'design': https://issuetracker.google.com/issues/180526528.
>
> Google was passing `w` to a call to parseMode(), when they should've been passing `wt` (the t stands for truncation). This is an easy mistake, since similar APIs (like POSIX [fopen](https://man7.org/linux/man-pages/man3/fopen.3.html)) will truncate by default when you simply pass `w`. Not only that, but previous Android releases had `parseMode("w")` truncate by default too! This change wasn't even documented until some time after the aforementioned [bug report](https://issuetracker.google.com/issues/180526528) was made.

A friend pointed me to [this issue, filed in 2019 during the Android 10 beta](https://issuetracker.google.com/issues/135714729). The developer reports an issue where [`ContentResolver.openFileDescriptor`](<https://developer.android.com/reference/android/content/ContentResolver#openFileDescriptor(android.net.Uri,%20java.lang.String)>) does not truncate the file. Google's response to the report:

> If you want to truncate the file, you need to pass the 't' open mode, so something like 'rwt'.

The developer pointed out:

> Thanks for the tip, use 'rwt' mode is working as I expected. But still, this behavior is different from previous Android system. this can cause compatibility issues. ... Should also mention this in the Android Q behavior change documentation.

This bug was closed as obsolete a year later. (A year after that, Google responded to the bug linked in the original post, eventually updated the documentation, and two years later, we're here now.)

I hope the irony that Google's undocumented API change had security impacts to a Google-developed app is not lost on you. But this goes beyond cropped images: any Android app using the wrong file modes for `ParcelFileDescriptor.parseMode`, for any data format, will result in incorrect behavior. At best, you get noticeable file corruption; at worst, you get this.

How many other Android apps are impacted by this API change? How many apps are impacted because they didn't carefully read the (updated) documentation, saw something that looked like POSIX, and assumed the semantics were the same?
