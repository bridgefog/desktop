#!/usr/bin/env babel-node

import fs from 'fs'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'
import PubTree from '../lib/discovery/pub-tree'
import Peer from '../lib/discovery/peer'
import Clubnet from '../lib/clubnet'
import Badge from '../lib/badge'

var ipfsClient = new IPFSClient(ipfsUtil.ipfsEndpoint())
var clubnet = new Clubnet(ipfsClient, () => new Badge())

clubnet.wearBadge()
  .then(key => console.log('Wearing badge:', key.name))

ipfsClient.peerID().then(myID => {
  var myPeer = new Peer(myID)
  return myPeer.resolve(ipfsClient).then(pubTreeKey => {
    return PubTree.fromIPFS(pubTreeKey, ipfsClient).then(pubTree => {
      pubTree.release = JSON.parse(fs.readFileSync('release.json'))
      console.log(pubTree.release)
      return pubTree.publish(ipfsClient).then(pubTreeKey => {
        console.log('Published to', pubTreeKey)
      })
    })
  })
})
.catch(err => {
  console.log('ERR', err, err.trace)
})
