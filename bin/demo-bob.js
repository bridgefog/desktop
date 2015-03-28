var url = require('url')
var util = require('util')
var debuglog = util.debuglog('bob');
var immutable = require('immutable')
var R = require('ramda')
var ipfs = require('../lib/ipfs-api-client')(url.parse('http://107.170.196.28:5001/api/v0'))
  // var DagObject = require('../lib/dag-object')

;
(function () {
  // TODO: Wear badge
  // TODO: build peerlist using DHT query. For now, just hard-coded:
  var peerlist = immutable.Set(['QmQWieUBw1aoqofViCfHcqyEKNxE5XBQX7VtrWcNmhDkGk'])

  ipfs.nameResolve(peerlist.first()).then(function (resolvedKey) {
    return ipfs.objectGet(resolvedKey + '/allthemusic/contents')
  }).then(function (thisPeersContents) {
    return immutable.Set().union(R.pluck('Hash', thisPeersContents.Links))
  }).then(function (contents) {
    debuglog('contents =', contents)

    contents.forEach(function (key) {
      ipfs.objectGet(key).then(function (object) {
        debuglog('got metadata for', key, '=', object)
      })
    })
  }).catch(function (reason) {
    console.log('FAILED', reason)
    if (reason instanceof Error) {
      console.log(reason.stack)
    }
  })
})()
