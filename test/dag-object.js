'use strict'

var DagObject = require('../lib/dag-object')
var assert = require('assert')
var immutable = require('immutable')

describe('DagObject', function () {
  describe('constructor', function () {
    context('with no arguments', function () {
      it('is empty', function () {
        var node = new DagObject()
        assert.equal(node.data, null)
        assert.equal(node.links.size, 0)
      })
    })

    context('with just links', function () {
      it('has links but no data', function () {
        var node = new DagObject({
          links: immutable.Set([1, 2, 3])
        })
        assert.equal(node.data, null)
        assert.equal(node.links.size, 3)
        assert.deepEqual(node.links.toJS(), [1, 2, 3])
      })
    })

    context('with just data', function () {
      it('has data but no links', function () {
        var node = new DagObject({
          data: 'foobarbaz'
        })
        assert.equal(node.data, 'foobarbaz')
      })
    })
  })

  describe('addLink', function () {
    function makeNode() {
      return new DagObject()
    }

    it('returns the node, for chaining', function () {
      var node = makeNode()
      assert(node.addLink('fakelink1', 'fakehash1') instanceof DagObject)
    })

    it('adds a link to the object with the given name and hash', function () {
      var node = makeNode()
      assert.equal(node.links.size, 0)
      node = node.addLink('name2', 'hash2')
      assert.equal(node.links.size, 1)
      assert.deepEqual(node.links.toJS(), [{
        name: 'name2',
        hash: 'hash2'
      }])
    })
  })

  describe('asJSONforAPI', function () {
    var data = 'foobarbaz'

    function subject() {
      return new DagObject({
        data: data
      }).asJSONforAPI()
    }

    it('returns buffer', function () {
      assert(subject() instanceof Buffer)
    })

    it('is encoded as JSON', function () {
      assert(JSON.parse(subject().toString()))
    })

    it('"Data" is encoded as base64', function () {
      var expectedData = new Buffer(data).toString('base64')
      var actualData = JSON.parse(subject().toString()).Data
      assert.equal(actualData, expectedData)
    })
  })
})
