'use strict'

import sinon from 'sinon'
import { assert } from 'chai'
import Clubnet from '../lib/clubnet'
import Badge from '../lib/badge'

describe('Clubnet', function () {
  var peerlist = ['peer_1', 'peer_2']
  var ipfs = {
    objectPut: sinon.stub().returns(Promise.resolve('thisisthehash')),
    dhtFindprovs: sinon.stub().returns(Promise.resolve(peerlist)),
  }
  var now = Date.now()
  var clubnet = new Clubnet(ipfs, () => new Badge(now))

  describe('wearBadge()', function () {
    before(function () {
      clubnet.badge = clubnet.buildBadge()
      return clubnet.wearBadge()
    })

    it('adds the badge\'s dagObject to IPFS', function () {
      assert(ipfs.objectPut.called)
    })

    it('adds the IPFS objectPut hash to the badge\' hash', function () {
      assert.equal(clubnet.badge.hash(), 'thisisthehash')
    })
  })

  describe('findPeers()', function () {
    it('returns the list of peers with the badge', function () {
      return clubnet.findPeers().then((peers) => assert.deepEqual(peers, peerlist))
    })

    it('adds the IPFS objectPut hash to the badge\' hash', function () {
      assert.equal(clubnet.badge.hash(), 'thisisthehash')
    })
  })
})
