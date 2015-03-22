'use strict'

var assert = require('assert')
var Badge = require('../lib/badge')

describe('Badge', function () {
  describe('currentName', function () {
    var now = Date.now()

    function subject() {
      return new Badge().currentName(now)
    }

    it('returns the current string to be hashed into a badge', function () {
      assert.equal(subject(), 'AllTheMusic:' + Math.round(now / (1000 * 60 * 60)))
    })
  })
})
