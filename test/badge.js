'use strict'

var assert = require('assert')
var vows = require('vows')
var ipfs = require('../lib/ipfs-api-client')('localhost', 9999)
var badge = require('../lib/badge')

vows.describe('Badge').addBatch({

  currentName: {
    topic: function () {
      var now = Date.now()
      new badge.currentName(now)
    },
    'returns the current string to be hashed into a badge': function (name) {
      assert.equal(name, "AllTheMusic:" + now * 0.001 * 0.001)
    }
  }

})
