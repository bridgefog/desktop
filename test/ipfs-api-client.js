'use strict'

var assert = require('assert')
var vows = require('vows')
var ipfs = require('../lib/ipfs-api-client')('localhost', 9999)

var knownHashes = {
  foo: 'QmWqEeZS1HELySbm8t8U55UkBe75kaLj9WnFb882Tkf5NL'
}

vows.describe('IPFS API').addBatch({
  addObject: {
    topic: function () {
      var dagNode = new ipfs.DagNode(null, 'foo')
      ipfs.addObject(dagNode, this.callback)
    },
    'returns a thing with the correct Hash': function (result) {
      assert.deepEqual(result, {
        Hash: knownHashes.foo,
        Links: []
      })
    }
  },

  'nameResolveSelf / namePublish': {
    topic: function () {
      ipfs.namePublish(knownHashes.foo, this.callback)
    },
    'returns nothing after publishing': {
      topic: function () {
        ipfs.nameResolveSelf(this.callback)
      },
      'returns the currently published key': function (result) {
        assert.deepEqual(result, knownHashes.foo)
      }
    }
  },

  DagNode: {
    'with no arguments': {
      topic: function () {
        return new ipfs.DagNode()
      },
      'it is empty': function (node) {
        assert.deepEqual(node, {
          links: [],
          data: ''
        })
      }
    },

    'with just links': {
      topic: function () {
        return new ipfs.DagNode([1, 2, 3], null)
      },
      'it has links but no data': function (node) {
        assert.deepEqual(node, {
          links: [1, 2, 3],
          data: ''
        })
      }
    },

    'with just data': {
      topic: function () {
        return new ipfs.DagNode(null, 'foobarbaz')
      },
      'it has data but no links': function (node) {
        assert.deepEqual(node, {
          links: [],
          data: 'foobarbaz'
        })
      }
    },

    asJSONforAPI: (function () {
      var data = 'foobarbaz'
      return {
        topic: function () {
          return new ipfs.DagNode(null, data).asJSONforAPI()
        },
        'returns buffer': function (buffer) {
          assert(buffer instanceof Buffer)
        },
        'is encoded as JSON': function (buffer) {
          assert(JSON.parse(buffer.toString()))
        },
        '"Data" is encoded as base64': function (buffer) {
          var expectedData = new Buffer(data).toString('base64')
          var actualData = JSON.parse(buffer.toString()).Data
          assert.equal(actualData, expectedData)
        }
      }
    })()
  }
}).export(module)
