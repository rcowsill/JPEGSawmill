#!/bin/bash

RUN_OPTS=(
  "--interactive"
  "--rm"
  "--volume=.:/src/JPEGSawmill/"
)

IMAGE_DIGEST="sha256:14ba09c8f3236fce4c0d46cde03a8471fa63f968f161cb6165bb2a8c9477a5aa"
VNU_IMAGE="ghcr.io/validator/validator@$IMAGE_DIGEST"

docker run "${RUN_OPTS[@]}" "$VNU_IMAGE" bash - <.github/scripts/vnu.sh
