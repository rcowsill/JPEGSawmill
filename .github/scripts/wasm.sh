#!/bin/bash

RUN_OPTS=(
  "--interactive"
  "--rm"
  "--user=$(id -u):$(id -g)"
  "--volume=.:/src/JPEGSawmill"
)

IMAGE_DIGEST="sha256:f9479effb0d095fea1c8501b57c18d13876a5e3bfebcb71f0da68a0fe49c935f"
EMSDK_IMAGE="emscripten/emsdk@$IMAGE_DIGEST"

docker run "${RUN_OPTS[@]}" "$EMSDK_IMAGE" bash - <.github/scripts/wasm/cmake.sh
