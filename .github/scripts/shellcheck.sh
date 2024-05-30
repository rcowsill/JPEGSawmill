#!/bin/bash

shopt -s globstar
shellcheck .github/scripts/**/*.sh
