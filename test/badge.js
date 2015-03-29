'use strict'

var expect = require('chai').expect
var Badge = require('../lib/badge')
var ipfsEndpoint = require('../lib/util').ipfsEndpoint
var ipfs = require('../lib/ipfs-api-client')(ipfsEndpoint())

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
    // this doesn't fail properly
    it.skip('publishes badge', function () {
      var badge = new Badge()
      badge.wear()

      ipfs.peerID().then(function (peerID) {
        expect(badge.wearers()).to.equal(peerID)
      })
    })
  })
})
