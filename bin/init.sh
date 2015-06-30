#!/bin/bash

set -e -x

npm prune
npm update

if ! which fpcalc 2> /dev/null; then
  OS=`uname`
  if [ "$OS" -eq "Darwin" ] && which brew 2> /dev/null; then
    brew install chromaprint
  else
    echo "ERROR: fpcalc not found in $PATH -- this is needed for adding music!" >&2
  fi
fi

bin/install-test-fixtures
