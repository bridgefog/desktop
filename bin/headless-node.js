#!/usr/bin/env babel-node

import childProcess from 'child_process'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'
import Clubnet from '../lib/clubnet'
import Badge from '../lib/badge'

var ipfsProc = childProcess.spawn('ipfs', ['daemon'], {
  stdio: ['ignore', 'inherit', 'inherit'],
})

ipfsProc.on('error', err => {
  console.error('IPFS process error', err.stack)
})
ipfsProc.on('exit', (code, signal) => {
  console.log('IPFS process exited (code=%s signal=%s)', code, signal)
  process.exit(1)
})

var ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())
var clubnet = new Clubnet(ipfs, () => new Badge())

function republish() {
  return ipfs.nameResolveSelf().then(key => {
    console.time('republishing: ' + key)
    return ipfs.namePublish(key)
      .then(() => console.timeEnd('republishing: ' + key))
  }).catch(err => console.log('ERROR from republish', err))
}

function wearBadge() {
  console.time('wearBadge')
  clubnet.wearBadge().then(key => {
    console.timeEnd('wearBadge')
    console.log('badge key =', key._hash)
  }).catch(err => console.log('ERROR from wearBadge', err))
}
const oneMinute = 60000
var wearBadgeInterval = setInterval(wearBadge, oneMinute)
var republishInterval = setInterval(republish, 10 * oneMinute)

setTimeout(() => {
  wearBadge()
  republish()
}, 5000)
