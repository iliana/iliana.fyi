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
unzip -jo Inter-3.19.zip "Inter Web"/Inter-{roman,italic}.var.woff2
unzip -jo webfont-iosevka-15.1.0.zip woff2/iosevka-extended{,bold}{,italic}.woff2
popd
