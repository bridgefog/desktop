'use strict'

var assert = require('assert')
var expect = require('chai').expect

var mockIpfs = require('./mock-ipfs')
var ipfs = require('../lib/ipfs-api-client')(mockIpfs.endpoint)
var DagObject = require('../lib/dag-object')

var knownHashes = {
  foo: 'QmWqEeZS1HELySbm8t8U55UkBe75kaLj9WnFb882Tkf5NL'
}

describe('IPFS API', function () {
  afterEach(function () {
    return mockIpfs.reset()
  })

  describe('peerID', function () {
    it('returns the peerID of this local node', function () {
      return mockIpfs.mock([{
        request: {
          url: '/api/v0/id',
          method: 'GET'
        },
        response: {
          headers: {
            'content-type': 'application/json'
          },
          body: {
            ID: 'this_is_my_peerid'
          }
        }
      }]).then(
        ipfs.peerID
      ).then(function (result) {
        assert.equal(result, 'this_is_my_peerid')
      })
    })
  })

  describe('addObject', function () {
    it('returns a thing with the correct Hash', function () {
      var dagNode = new DagObject({
        data: 'foo'
      })

      // TODO: Ensure the body of the request looks right
      return mockIpfs.mock([{
        request: {
          url: '/api/v0/object/put',
          query: {
            arg: 'json',
          },
          method: 'POST'
        },
        response: {
          headers: {
            'content-type': 'application/json'
          },
          body: {
            Hash: knownHashes.foo,
            Links: []
          }
        }
      }]).then(function () {
        return ipfs.addObject(dagNode)
      }).then(function (result) {
        assert.deepEqual(result, {
          Hash: knownHashes.foo,
          Links: []
        })
      })
    })
  })

  describe('namePublish', function () {
    it('can publish a key to itself', function () {
      return mockIpfs.mock([{
        request: {
          url: '/api/v0/name/publish',
          query: {
            arg: knownHashes.foo,
          },
          method: 'GET'
        },
        response: {
          headers: {
            'content-type': 'application/json'
          },
          body: {
            Name: 'my_peer_id',
            Value: knownHashes.foo,
          }
        }
      }]).then(function () {
        return ipfs.namePublish(knownHashes.foo)
      }).then(function (response) {
        assert.deepEqual(response.Value, knownHashes.foo)
      })
    })
  })

  describe('nameResolve', function () {
    context('requests /name/resolve with the given peerId', function () {
      it('returns the resolved key', function () {
        var peerId = 'peer_id_1234'

        return mockIpfs.mock([{
          request: {
            url: '/api/v0/name/resolve',
            query: {
              arg: peerId,
            },
            method: 'GET'
          },
          response: {
            headers: {
              'content-type': 'application/json'
            },
            body: {
              Key: knownHashes.foo
            }
          }
        }]).then(function () {
          return ipfs.nameResolve(peerId)
        }).then(function (hash) {
          assert.equal(hash, knownHashes.foo)
        })
      })
    })
  })

  describe('dhtFindprovs', function () {
    context('the given contentID', function () {
      it('returns array of peerIds who have contentID', function () {
        var contentID = 'this_is_content_id'

        var mock = mockIpfs.mock([{
          request: {
            url: '/api/v0/dht/findprovs/this_is_content_id',
            method: 'GET'
          },
          response: {
            headers: {'content-type': 'application/json'},
            body: {
              Extra: '',
              ID: '',
              Responses: [
                {Addrs: null, ID: 'peer_id_1'},
                {Addrs: null, ID: 'peer_id_2'},
                {Addrs: null, ID: 'peer_id_3'},
              ],
              Type: 4
            }
          }
        }])

        var peerIDs = mock.then(function () { return ipfs.dhtFindprovs(contentID) })

        return peerIDs.then(function (peerIDs) {
          expect(peerIDs).to.eql(['peer_id_1', 'peer_id_2', 'peer_id_3'])
        })
      })
    })
  })

})
