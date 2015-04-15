'use strict'

import { assert } from 'chai'
import { Set } from 'immutable'
import { DagObject, DagLink } from '../lib/dag-object'

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
        var node = new DagObject({ links: new Set([1, 2, 3]) })
        assert.equal(node.data, null)
        assert.equal(node.links.size, 3)
        assert.deepEqual(node.links.toJS(), [1, 2, 3])
      })
    })

    context('with just data', function () {
      it('has data but no links', function () {
        var node = new DagObject({ data: 'foobarbaz' })
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

    it('adds a link to the object with the given name and hash, and maintains order', function () {
      var node = makeNode()
      assert.equal(node.links.size, 0)
      node = node.addLink('name1', 'hash1')
      // node = node.addLink('name1', 'hash1')
      node = node.addLink('name2', 'hash2')
      assert.equal(node.links.size, 2)
      assert.deepEqual(node.links.toJS(), [
        new DagLink('name1', 'hash1', 0),
        new DagLink('name2', 'hash2', 0),
      ])
    })
  })

  describe('asJSONforAPI', function () {
    function examples(object) {
      var subject = function () {
        return object.asJSONforAPI()
      }
      return function () {
        it('"Data" is encoded as base64', function () {
          var expectedData = new Buffer(object.data || '').toString('base64')
          var actualData = subject().Data
          assert.equal(actualData, expectedData)
        })

        it('"Links" look correct', function () {
          var expectedLinks = object.links.map(function (l) {
            return {
              Name: l.name,
              Hash: l.hash,
              Size: l.size,
            }
          }).toJS()
          assert.deepEqual(subject().Links, expectedLinks)
        })
      }
    }

    context('with only data', examples(new DagObject({ data: 'asdf' })))

    context('with only links', examples(new DagObject()
                                        .addLink('name', 'key1')
                                        .addLink('', 'key2')))

    context('with data & links', examples(new DagObject({ data: 'foo' })
                                          .addLink('name', 'key1')
                                          .addLink('', 'key2')))
  })
})
