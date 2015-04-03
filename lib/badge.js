'use strict'

var util = require('../lib/util')
var ipfs = require('../lib/ipfs-api-client')(util.ipfsEndpoint())
var DagObject = require('../lib/dag-object')

var Badge = function () {}

Badge.prototype.currentName = function (now) {
  now = (typeof now === 'undefined') ? Date.now() : now
  var oneHourInMilliseconds = 1000 * 60 * 60
  return 'AllTheMusic:' + Math.round(now / oneHourInMilliseconds)
}

Badge.prototype.wear = function () {
  var dagNode = new DagObject({ data: this.currentName() })

  this.currentId = ipfs.addObject(dagNode)
}

Badge.prototype.wearers = function () {
  // return ipfs.findProvs(this.currentId)
  return 'QmXYYGhut5ZTXGHeTqdvAHYxcMkPfwy85Dwsn4CAwKJPLb'
}

module.exports = Badge
