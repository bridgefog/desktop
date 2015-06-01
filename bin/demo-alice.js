#!/usr/bin/env babel-node

'use strict'

import R from 'ramda'
import demoInvent from '../demos/alice'
import demoFromFile from '../demos/alice-from-contents-file'

var demo
if (R.contains('--from-file', process.argv)) {
  console.log('Loading from ./tmp/contents')
  demo = demoFromFile
} else {
  demo = demoInvent
}

if (R.intersection(['ipfs', 'alice'], (process.env.NODE_DEBUG || '').split(',')).length === 0) {
  console.log('Set NODE_DEBUG to include "ipfs" or "alice" to see more log output')
}

function run() {
  demo().then(() => {
    if (R.contains('--loop', process.argv)) { setTimeout(run, 40000) }
  })
}

run()
