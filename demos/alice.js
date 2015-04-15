'use strict'

import util from 'util'
import * as atm from '../'

var debuglog = util.debuglog('alice');
var ipfs = atm.IPFSClient(atm.util.ipfsEndpoint())
var DagObject = atm.dag.DagObject
var clubnet = new atm.Clubnet(ipfs, () => new atm.Badge())

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function inventMetadataNode() {
  return {
    title: util.format('My song %d', randomInt(0, 100)),
    artist: util.format('Artist %d', randomInt(0, 100)),
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
  return ipfs.addObject(obj)
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
  return ipfs.addObject(contentsNode).then(function (contentsNode) {
    return ipfs.addObject(new DagObject().addLink('contents', contentsNode))
  }).then(function (atmNode) {
    return ipfs.addObject(new DagObject().addLink('allthemusic', atmNode))
  })
}

export default function () {
  clubnet.wearBadge().
    then(() => addSomeSongs(inventSomeSongs())).
    then(objects => addDirectoryTree(objects)).
    then(directoryNode => ipfs.namePublish(directoryNode)).
    catch((reason) => {
      debuglog('FAILED', reason)
      if (reason instanceof Error) { console.log(reason.stack) }
    })
}
