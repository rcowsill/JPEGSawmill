#!/bin/bash

RUN_OPTS=(
  "--interactive"
  "--rm"
  "--volume=.:/src/JPEGSawmill/"
)

IMAGE_DIGEST="sha256:f4ceed83064a348fd23529039ce8634f8ba49ce5df26a5f10f94adf384cbebce"
VNU_IMAGE="ghcr.io/validator/validator@$IMAGE_DIGEST"

docker run "${RUN_OPTS[@]}" "$VNU_IMAGE" bash - <.github/scripts/vnu.sh
