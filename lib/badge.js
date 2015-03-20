'use strict'

function Badge() {}

Badge.prototype.currentName = function (now) {
  now = (typeof now === 'undefined') ? Date.now() : now
  var oneHourInMilliseconds = 1000 * 60 * 60
  return 'AllTheMusic:' + Math.round(now / oneHourInMilliseconds)
}

module.exports = Badge
