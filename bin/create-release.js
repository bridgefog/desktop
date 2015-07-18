#!/usr/bin/env babel-node

import fs from 'fs'

import { IPFSClient, util as ipfsUtils } from 'atm-ipfs-api'
import { Directory } from '../lib/ipfs-tree'

var version = require('../package.json').version

var ipfsClient = new IPFSClient(ipfsUtils.ipfsEndpoint())

// ipfs add -q -r pkg/Fog-darwin-x64/Fog.app/Contents/Resources/app/ | tail -n 1
// supply key as argument
var appDirKey = process.argv[2]

var releaseDir = new Directory({
  'Darwin-x64': appDirKey,
})
releaseDir.addToIPFS(ipfsClient).then(releaseKey => {
  var releaseObject = {
    payload: {
      version,
      ipfsKey: releaseKey,
    },

    signatures: [],
  }

  fs.writeFileSync('release.json', JSON.stringify(releaseObject) + '\n')
  console.log(releaseObject)
})
.catch(err => {
  console.error('ERROR', err.stack)
})
