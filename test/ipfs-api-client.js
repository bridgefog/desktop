'use strict'

var url = require('url')
var assert = require('assert')

var ipfs_endpoint = url.parse(process.env.ipfs_endpoint || process.env.npm_package_config_ipfs_endpoint)
var ipfs = require('../lib/ipfs-api-client')(ipfs_endpoint)
var DagObject = require('../lib/dag-object')

var knownHashes = {
  foo: 'QmWqEeZS1HELySbm8t8U55UkBe75kaLj9WnFb882Tkf5NL'
}

describe('IPFS API', function () {
  describe('addObject', function () {
    it('returns a thing with the correct Hash', function () {
      var dagNode = new DagObject({
        data: 'foo'
      })

      return ipfs.addObject(dagNode).then(function (result) {
        assert.deepEqual(result, {
          Hash: knownHashes.foo,
          Links: []
        })
      })
    })
  })

  describe('namePublish / nameResolveSelf', function () {
    it('can publish a key to itself and then return the key that was published', function () {
      return ipfs.namePublish(knownHashes.foo).then(function () {
        return ipfs.nameResolveSelf()
      }).then(function (resolvedName) {
        assert.deepEqual(resolvedName, knownHashes.foo)
      })
    })
  })

  describe('nameResolve', function () {
    context('requests /name/resolve with the given peerId', function () {
      it.skip('returns the resolved key', function () {
        var peerId = 'asdf'

        return ipfs.nameResolve(peerId).then(function (hash) {
          assert.equal(hash, 'abcdef')
        })
      })
    })
  })
})
