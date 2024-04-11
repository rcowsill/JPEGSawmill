#!/bin/bash

TEST_PRESET="unit-test"

cmake --preset="$TEST_PRESET" -G "Unix Makefiles"
cmake --build --preset="$TEST_PRESET"
ctest --preset="$TEST_PRESET"
