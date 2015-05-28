'use strict'

import util from 'util'
import { Set } from 'immutable'
import R from 'ramda'
import * as atm from '../'

var debuglog = util.debuglog('bob');
var ipfs = atm.IPFSClient(atm.util.ipfsEndpoint())

var peerlist = new Set()

function fetchPeers() {
  // TODO: build peerlist using DHT query. For now, just hard-coded:
  peerlist = peerlist.union(['QmQWieUBw1aoqofViCfHcqyEKNxE5XBQX7VtrWcNmhDkGk'])
  return Promise.resolve(peerlist)
}

export default function () {
  // TODO: Wear badge
  fetchPeers().then(function () {
    return ipfs.nameResolve(peerlist.first())
  }).then(function (resolvedKey) {
    return ipfs.objectGet(resolvedKey + '/allthemusic/contents')
  }).then(function (thisPeersContents) {
    return new Set().union(R.pluck('Hash', thisPeersContents.Links))
  }).then(function (contents) {
    debuglog('contents =', contents)

    contents.forEach(function (key) {
      ipfs.objectGet(key).then(function (object) {
        console.log('BOB got metadata for', key, '=', object)
      })
    })
  }).catch(function (reason) {
    console.log('FAILED', reason)
    if (reason instanceof Error) {
      console.log(reason.stack)
    }
  })
}
