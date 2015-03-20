'use strict'

var assert = require('assert')
var vows = require('vows')
  // var ipfs = require('../lib/ipfs-api-client')('localhost', 9999)
var Badge = require('../lib/badge')

vows.describe('Badge').addBatch({

  currentName: (function () {
    var now = Date.now()
    return {
      topic: function () {
        return new Badge().currentName(now)
      },
      'returns the current string to be hashed into a badge': function (name) {
        assert.equal(name, 'AllTheMusic:' + Math.round(now / (1000 * 60 * 60)))
      }
    }
  })()

}).export(module)
