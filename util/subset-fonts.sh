#!/usr/bin/env bash
set -euo pipefail

fetch() {
    filename=${1##*/}
    [[ -e $filename ]] || curl -L -o "$filename" "$1"
    grep -F "$filename" SHA256SUMS | sha256sum -c
}

cd "${BASH_SOURCE%/*}/.."

pushd fonts
fetch https://github.com/rsms/inter/releases/download/v3.19/Inter-3.19.zip
fetch https://github.com/be5invis/Iosevka/releases/download/v15.1.0/webfont-iosevka-15.1.0.zip
unzip -jo -d ../static/ Inter-3.19.zip "Inter Web"/Inter-{roman,italic}.var.woff2
unzip -jo -d ../static/ webfont-iosevka-15.1.0.zip woff2/iosevka-extended{,bold}{,italic}.woff2
popd

if [[ ${1:-} != "dev" ]]; then
    unicodes=$(find public -type f '(' -name '*.html' -or -name '*.css' ')' -print0 \
        | xargs -0 cat \
        | python3 -c 'print(",".join("u+{:x}".format(ord(c)) for c in sorted(set(open(0).read()))))')

    pushd static
    for f in *.woff2; do
        [[ $f == Inter* ]] && features="calt,dnom,frac,locl,numr,pnum,tnum,kern,case,ss03"
        [[ $f == iosevka* ]] && features="calt,locl,ccmp"
        pyftsubset "$f" --output-file=../public/"$f" --flavor=woff2 \
            --unicodes="U+0020-007F,$unicodes" --layout-features="$features"
    done
    popd
fi
