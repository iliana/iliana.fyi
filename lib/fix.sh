#!/usr/bin/env bash

# fix for https://github.com/wilsonzlin/minify-html/issues/55 while we wait for a new zola version
find public -name '*.html' -exec sed -i '' -e 's/alt=FIXME/alt/' {} +
