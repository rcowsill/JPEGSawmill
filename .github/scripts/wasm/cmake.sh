#!/bin/bash

RELEASE_PRESET="emscripten-release"

cd JPEGSawmill || exit 1
cmake --preset="$RELEASE_PRESET" -G "Unix Makefiles" -D CMAKE_CXX_COMPILER="em++"
CLICOLOR_FORCE=1 cmake --build --preset="$RELEASE_PRESET" --target=install
