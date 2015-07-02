#!/bin/bash

set -e

npm prune
npm install

if ! which fpcalc 2> /dev/null; then
  OS=`uname`
  if [[ "$OS" == "Darwin" ]] && which brew 2> /dev/null; then
    brew install chromaprint
  else
    echo 'WARNING: fpcalc not found in $PATH -- this is needed for adding music!' >&2
  fi
fi

bin/install-test-fixtures
