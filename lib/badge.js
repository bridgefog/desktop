'use strict'

var DagObject = require('./dag-object')

const oneHourInMilliseconds = 1000 * 60 * 60
const prefix = 'AllTheMusic:'

var Badge = function (nameSpace, now) {
  this._hash = null
  now = now || Date.now()
  var hoursSinceEpoch = Math.round(now / oneHourInMilliseconds)
  nameSpace = nameSpace || ''
  this.name =  prefix + nameSpace + hoursSinceEpoch
}

Badge.prototype.dagObject = function () {
  return new DagObject({ data: this.name })
}

Badge.prototype.hash = function () {
  // eventually this will actually calculate the hash, but for now, we're
  // shoving the hash from IPFS back into this object
  return this._hash
}

Badge.prototype.setHash = function (hash) {
  this._hash = hash
}

module.exports = Badge
