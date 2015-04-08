'use strict'

var sinon = require('sinon')
var assert = require('chai').assert
var Clubnet = require('../lib/clubnet')
var Badge = require('../lib/badge')

describe('Clubnet', function () {
  var ipfs = {
    objectPut: sinon.stub().returns(Promise.resolve('thisisthehash'))
  }
  var clubnet = Clubnet(ipfs)
  var now = Date.now()
  var badge = new Badge(null, now)

  describe('wearBadge()', function () {
    before(function () { clubnet.wearBadge(badge) })

    it('adds the badge\'s dagObject to IPFS', function () {
      assert(ipfs.objectPut.called)
    })

    it('adds the IPFS objectPut hash to the badge\' hash', function () {
      assert.equal(badge.hash(), 'thisisthehash')
    })
  })
})
