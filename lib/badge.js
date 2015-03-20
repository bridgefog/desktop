'use strict'

module.exports = function () {
  function currentName (now) {
    var now = (now === 'undefined') ? Date.now() : now
    var twoPointSevenHours = 10000000
    return "AllTheMusic:" + Math.round(now / twoPointSevenHours)
  }

  return {
    currentName: currentName
  }
}
