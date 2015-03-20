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
  var obj = new ipfs.DagNode([], JSON.stringify(metadata))
  debuglog(obj.asJSONforAPI().toString('utf-8'))
  return new Promise(function (resolve, reject) {
    ipfs.addObject(obj, function (error, key) {
      if (error) {
        reject(error)
      } else {
        resolve(key)
      }
    })
  })
}

// ipfs.nameResolveSelf(function (error, key) {
//   debuglog(error, key)
// });

(function () {
  // Wear badge
  // Add some songs to ipfs
  var songs = inventSomeSongs()
  var addRequests = []
  for (i = 0; i < songs.length; i++) {
    addRequests[i] = addSongMetadataNode(songs[i])
  }
  Promise.all(addRequests).then(
      function (values) {
        debuglog(values)
      },
      function (reason) {
        debuglog('FAILED', reason)
      })
    // Add those keys to 'contents'
    // re-publish directory
})()
