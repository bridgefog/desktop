#!/bin/sh

# Source this in your shell

# Open Chrome dev tools
# NODE_ENV=development

export PATH=$PWD/node_modules/.bin:$PATH

ipfs-select() {
  if [[ $1 == "app" ]]; then
    export IPFS_PATH="$HOME/Library/Application Support/com.bridgefog.beam/ipfs"
    echo 'ipfs-select: Using app-embedded IPFS_PATH' 1>&2
  else
    unset IPFS_PATH
    echo 'ipfs-select: Using default IPFS_PATH' 1>&2
  fi
}
