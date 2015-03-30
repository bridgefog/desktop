'use strict'

// var ipfs = require('../lib/ipfs-api-client')

function Badge() {}

Badge.prototype.currentName = function (now) {
  now = (typeof now === 'undefined') ? Date.now() : now
  var oneHourInMilliseconds = 1000 * 60 * 60
  return 'AllTheMusic:' + Math.round(now / oneHourInMilliseconds)
}

Badge.prototype.wear = function () {}

Badge.prototype.wearers = function () {

}

module.exports = Badge
