'use strict'

import os from 'os'
import { format, debuglog as newDebuglog } from 'util'
import { IPFSClient, dag, Clubnet, Badge, util as u } from '../'

var debuglog = newDebuglog('alice')
var ipfs = new IPFSClient(u.ipfsEndpoint())
var DagObject = dag.DagObject
var clubnet = new Clubnet(ipfs, () => new Badge())

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function inventMetadataNode() {
  return {
    artist: format('%s %d', os.hostname(), randomInt(0, 100)),
    title: format('My song %d', randomInt(0, 100)),
  }
}

function inventSomeSongs() {
  var songs = []
  for (var i = 0; i <= 10; i++) {
    songs[i] = inventMetadataNode()
    debuglog('songs[%d] =', i, songs[i])
  }
  return songs
}

function addSongMetadataNode(metadata) {
  var obj = new DagObject({ data: JSON.stringify(metadata) })
  debuglog(JSON.stringify(obj.asJSONforAPI()))
  return ipfs.objectPut(obj)
}

function addSomeSongs(songs) {
  var addRequests = []
  for (var i = 0; i < songs.length; i++) {
    addRequests[i] = addSongMetadataNode(songs[i])
  }
  return Promise.all(addRequests)
}

function addDirectoryTree(contents) {
  var contentsNode = new DagObject()
  for (var i = 0; i < contents.length; i++) {
    contentsNode = contentsNode.addLink('', contents[i])
  }
  return ipfs.objectPut(contentsNode)
    .then(contentsNodeHash => ipfs.objectPut(new DagObject().addLink('contents', contentsNodeHash)))
    .then(atmNodeHash => ipfs.objectPut(new DagObject().addLink('allthemusic', atmNodeHash)))
}

export default function () {
  return clubnet.wearBadge()
    .then(() => addSomeSongs(inventSomeSongs()))
    .then(objects => addDirectoryTree(objects))
    .then(directoryNode => ipfs.namePublish(directoryNode))
    .then(key => console.log('Published', key))
    .catch((reason) => {
      debuglog('FAILED', reason)
      if (reason instanceof Error) { console.log(reason.stack) }
    })
}
