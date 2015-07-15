#!/usr/bin/env babel-node

import fs from 'fs'

// ipfs add -r pkg/app/BridgeFog.app/Contents/Resources/app
// QmS5GMMaDp4Lpr5ZKaYYH1134sGNR1NDj3r7EYhkqn4UZf

var releaseKey = 'QmS5GMMaDp4Lpr5ZKaYYH1134sGNR1NDj3r7EYhkqn4UZf'
var timestamp = new Date().getTime()

var releaseObject = {
  payload: {
    timestamp: timestamp,
    ipfsKey: releaseKey,
  },

  signatures: [],
}

fs.writeFileSync('release.json', JSON.stringify(releaseObject))
