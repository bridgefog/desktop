'use strict'

import os from 'os'
import fs from 'fs'
import { format, debuglog as newDebuglog } from 'util'
import { IPFSClient, DagObject, util as u } from 'atm-ipfs-api'
import Clubnet from '../lib/clubnet'
import Badge from '../lib/badge'

var debuglog = newDebuglog('alice')
var ipfs = new IPFSClient(u.ipfsEndpoint())
var clubnet = new Clubnet(ipfs, () => new Badge())

function addDirectoryTree(contents) {
  var contentsNode = new DagObject()
  for (var i = 0; i < contents.length; i++) {
    contentsNode = contentsNode.addLink('', contents[i])
  }
  return ipfs.objectPut(contentsNode)
    .then(contentsNodeHash => ipfs.objectPut(new DagObject().addLink('contents', contentsNodeHash)))
    .then(atmNodeHash => ipfs.objectPut(new DagObject().addLink('allthemusic', atmNodeHash)))
}

function readContentsFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf-8' }, (err, data) => {
      if (err) { return reject(err) }
      resolve(data.split(/\n/).slice(0, -1))
    })
  })
}

export default function () {
  return clubnet.wearBadge()
    .then(() => readContentsFile('tmp/contents'))
    .then(contentsList => addDirectoryTree(contentsList))
    .then(directoryNode => ipfs.namePublish(directoryNode))
    .then(key => console.log('Published', key))
    .catch((reason) => {
      debuglog('FAILED', reason)
      if (reason instanceof Error) { console.log(reason.stack) }
    })
}
