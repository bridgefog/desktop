var util = require('util')
var debuglog = util.debuglog('alice');
var ipfs = require('../lib/ipfs-api-client')('localhost', 5001)

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
  for (i = 0; i <= 10; i++) {
    songs[i] = inventMetadataNode()
    debuglog('songs[%d] =', i, songs[i])
  }
  return songs
}

function addSongMetadataNode(metadata) {
  var obj = new ipfs.DagNode({
    data: JSON.stringify(metadata)
  })
  debuglog(obj.asJSONforAPI().toString('utf-8'))
  return addObjectToIPFS(obj)
}

function addObjectToIPFS(object) {
  return new Promise(function (resolve, reject) {
    ipfs.addObject(object, function (error, response) {
      if (error) {
        reject(error)
      } else {
        debuglog('addObjectToIPFS()', object, response)
        resolve(response.Hash)
      }
    })
  })
}

function addSomeSongs(songs) {
  var addRequests = []
  for (i = 0; i < songs.length; i++) {
    addRequests[i] = addSongMetadataNode(songs[i])
  }
  return Promise.all(addRequests)
}

function addDirectoryTree(contentsKeys) {
  var contentsNode = new ipfs.DagNode()
  for (i = 0; i < contentsKeys.length; i++) {
    contentsNode = contentsNode.addLink('', contentsKeys[i])
    debuglog('contentsNode = ', contentsNode)
  }
  return addObjectToIPFS(contentsNode).then(function (contentsNodeHash) {
    var atmNode = new ipfs.DagNode().addLink('contents', contentsNodeHash)
    return addObjectToIPFS(atmNode)
  }).then(function (atmNodeHash) {
    var directoryNode = new ipfs.DagNode().addLink('allthemusic', atmNodeHash)
    return addObjectToIPFS(directoryNode)
  })
}

(function () {
  // Wear badge
  // Add some songs to ipfs
  addSomeSongs(inventSomeSongs()).then(function (objects) {
    debuglog(objects)
    return addDirectoryTree(objects)
  }).then(function (directoryNodeHash) {
    return new Promise(function (resolve, reject) {
      ipfs.namePublish(directoryNodeHash, function (error) {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }).catch(function (reason) {
    debuglog('FAILED', reason)
    if (reason instanceof Error) {
      debuglog(reason.stack)
    }
  })

  // Add those keys to 'contents'
  // re-publish directory
})()
