'use strict'

var sinon = require('sinon')
var assert = require('chai').assert
var _clubnet = require('../lib/clubnet')
var Badge = require('../lib/badge')

describe('Clubnet', function () {
  var peerlist = ['peer_1', 'peer_2']
  var ipfs = {
    objectPut: sinon.stub().returns(Promise.resolve('thisisthehash')),
    dhtFindprovs: sinon.stub().returns(Promise.resolve(peerlist)),
  }
  var clubnet = _clubnet(ipfs)
  var now = Date.now()

  describe('wearBadge()', function () {
    var badge
    before(function () {
      badge = new Badge(null, now)
      return clubnet.wearBadge(badge)
    })

    it('adds the badge\'s dagObject to IPFS', function () {
      assert(ipfs.objectPut.called)
    })

    it('adds the IPFS objectPut hash to the badge\' hash', function () {
      assert.equal(badge.hash(), 'thisisthehash')
    })
  })

  describe('findPeers()', function () {
    var badge
    before(function () {
      badge = new Badge(null, now)
    })

    it('returns the list of peers with the badge', function () {
      return clubnet.findPeers(badge).then(function (peers) {
        assert.deepEqual(peers, peerlist)
      })
    })

    it('adds the IPFS objectPut hash to the badge\' hash', function () {
      assert.equal(badge.hash(), 'thisisthehash')
    })
  })
})
