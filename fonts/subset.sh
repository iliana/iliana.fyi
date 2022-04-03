#!/usr/bin/env bash
set -euo pipefail

cd "${BASH_SOURCE%/*}/../public"

unicodes=$(find . -type f '(' -name '*.html' -or -name '*.css' ')' -print0 \
    | xargs -0 cat \
    | python3 -c 'print(",".join("u+{:x}".format(ord(c)) for c in sorted(set(open(0).read()))))')

for f in *.woff2; do
    echo "$f"
    [[ $f == Inter* ]] && features="calt,dnom,frac,locl,numr,pnum,tnum,kern,case,ss03"
    [[ $f == iosevka* ]] && features="calt,locl,ccmp"
    pyftsubset "$f" --flavor=woff2 \
        --unicodes="U+0020-007F,$unicodes" --layout-features="$features"
    mv "${f%.woff2}.subset.woff2" "$f"
done
