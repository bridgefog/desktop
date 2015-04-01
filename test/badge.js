'use strict'

var expect = require('chai').expect
var Badge = require('../lib/badge')
var util = require('../lib/util')
var ipfs = require('../lib/ipfs-api-client')(util.ipfsEndpoint())

describe('Badge', function () {
  describe('currentName', function () {
    var now = Date.now()

    function subject() {
      return new Badge().currentName(now)
    }

    it('returns the current string to be hashed into a badge', function () {
      expect(subject()).to.eql('AllTheMusic:' + Math.round(now / (1000 * 60 * 60)))
    })
  })

  describe('wear', function () {
    it('publishes badge', function () {
      var badge = new Badge()
      badge.wear()

      return ipfs.peerID().then(function (peerID) {
        expect(badge.wearers()).to.include(peerID)
      })
    })
  })
})
