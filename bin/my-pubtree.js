#!/usr/bin/env babel-node

import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'
import PubTree from '../lib/discovery/pub-tree'
import Peer from '../lib/discovery/peer'
var ipfsClient = new IPFSClient(ipfsUtil.ipfsEndpoint())

ipfsClient.peerID().then(myID => {
  var myPeer = new Peer(myID)
  console.log('My Peer:', myPeer.decoratedID())
  console.log()
  return myPeer.resolve(ipfsClient).then(pubTreeKey => {
    return PubTree.fromIPFS(pubTreeKey, ipfsClient).then(pubTree => {
      console.log('Track count:\n', pubTree.tracks.length, '\n')
      console.log('Peers:\n', pubTree.peers, '\n')
      console.log('Release:\n', pubTree.release, '\n')
    })
  })
})
.catch(err => {
  console.log('ERR', err)
})
