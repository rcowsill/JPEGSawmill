#!/bin/bash

VALIDATE_OPTS=(
  "--also-check-css"
  "--also-check-svg"
  "--skip-non-html"
  "--stdout"
  "--asciiquotes"
  "--verbose"
  "--filterfile" "../.vnurc"
)

cd src/JPEGSawmill/_site || exit 1
unset JAVA_TOOL_OPTIONS
/vnu-runtime-image/bin/vnu "${VALIDATE_OPTS[@]}" .
