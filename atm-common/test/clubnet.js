'use strict'

import sinon from 'sinon'
import streamify from 'stream-array'
import { assert } from 'chai'
import R from 'ramda'
import Clubnet from '../lib/clubnet'
import Badge from '../lib/badge'

describe('Clubnet', function () {
  var discoveredProviders = [
    { ID: 'peer_1', Addresses: null },
    { ID: 'peer_2', Addresses: null },
    { ID: 'peer_3', Addresses: null },
  ]
  var discoveredProvidersIDs = R.pluck('ID', discoveredProviders)

  var ipfs = {
    objectPut: sinon.stub().returns(Promise.resolve('thisisthehash')),
    dhtFindprovs: () => Promise.resolve(streamify(discoveredProviders)),
  }

  var now = Date.now()
  var buildClubnet = function () {
    return new Clubnet(ipfs, () => new Badge(now))
  }

  describe('wearBadge()', function () {
    it('adds the badge\'s dagObject to IPFS', function () {
      return buildClubnet().wearBadge()
        .then(() => {
          assert(ipfs.objectPut.called)
        })
    })

    it('adds the IPFS objectPut hash to the badge\' hash', function () {
      var clubnet = buildClubnet()
      return clubnet.wearBadge()
        .then(() => {
          assert.equal(clubnet.badge.hash(), 'thisisthehash')
        })
    })
  })

  describe('findPeers()', function () {
    it('returns the list of peers with the badge', function () {
      return buildClubnet().findPeers()
        .then((peers) => assert.deepEqual(peers, discoveredProvidersIDs))
    })

    it('exposes found peers as .peerlist', function () {
      var clubnet = buildClubnet()
      return clubnet.findPeers()
        .then(() => assert.deepEqual(clubnet.peerlist.toJS(), discoveredProvidersIDs))
    })

    it('emits "peer" for each peer discovered', function () {
      var clubnet = buildClubnet()
      var emittedPeers = []

      clubnet.on('peer', p => emittedPeers.push(p))

      return clubnet.findPeers()
        .then(() => assert.deepEqual(emittedPeers, discoveredProvidersIDs))
    })

    it('emits "newPeer" for each new peer discovered', function () {
      var clubnet = buildClubnet()
      var emittedPeers = []

      // lets assume it already found peer_1
      clubnet.addPeer('peer_1')

      clubnet.on('newPeer', p => emittedPeers.push(p))

      return clubnet.findPeers()
        .then(() => assert.deepEqual(emittedPeers, ['peer_2', 'peer_3']))
    })
  })
})
