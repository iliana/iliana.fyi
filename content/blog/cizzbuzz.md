---
title: Experimenting with GitHub merge queues; could you send me a PR?
date: 2024-10-02T20:00:00-07:00
---

I'm evaluating the usability of [GitHub merge queues](https://github.blog/news-insights/product-news/github-merge-queue-is-generally-available/) under a set of conditions that makes merge queues hard: pull requests have a high probability of failing CI when merged together despite passing on their own. (Plus, GitHub's implementation has like 11 different knobs, and the documentation is somewhat limited.)

I could make a bunch of PRs on my own, but that's boring, and I'm not good at finding edge cases on my own. So I am welcoming you to send PRs of whatever to [haha-business/cizzbuzz](https://github.com/haha-business/cizzbuzz), a repository whose default branch is guaranteed to have the total number of lines across all files be divisible by 3 or 5, but not both.

I've done one batch of merges and have already learned quite a bit, and now have a lot more questions to answer. I'm keeping notes and I'll turn them into a blog post Soon™.

(If you do send a PR, thanks in advance! Understand that the likelihood of your PR being kicked out of the merge queue is probably about a coin flip; this is by design, but by no means do you need to babysit your PR to rebase it. It might still get merged later on anyway due to anything that lands later!)
