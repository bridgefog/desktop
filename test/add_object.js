'use strict';

var vows = require('vows'),
    assert = require('assert'),
    thing = require('../');

vows.describe('IPFS API').addBatch({
    'object/put': {
        topic: function () {
            return 'foo';
        },

        'add object': {
            topic: function (object) {
                var dagNode = new thing.DagNode(null, object);
                thing.addObject(dagNode, this.callback);
            },
            'returns a thing with the correct Hash': function (result) {
                assert.deepEqual(result, {
                    Hash: 'QmWqEeZS1HELySbm8t8U55UkBe75kaLj9WnFb882Tkf5NL',
                    Links: []
                });
            }
        },

        'DagNode': {
            'with no arguments': {
                topic: function () {
                    return new thing.DagNode();
                },
                'it is empty': function (node) {
                    assert.deepEqual(node, {
                        links: [],
                        data: ''
                    });
                }
            },
            'with just links': {
                topic: function () {
                    return new thing.DagNode([1, 2, 3], null);
                },
                'it has links but no data': function (node) {
                    assert.deepEqual(node, {
                        links: [1, 2, 3],
                        data: ''
                    });
                }
            },
            'with just data': {
                topic: function () {
                    return new thing.DagNode(null, 'foobarbaz');
                },
                'it has links but no data': function (node) {
                    assert.deepEqual(node, {
                        links: [],
                        data: 'foobarbaz'
                    });
                },
                'asJSONforAPI': {
                  topic: function(node) {
                    return node.asJSONforAPI();
                  },
                  'returns buffer': function(buffer){
                    assert(buffer instanceof Buffer);
                  },
                  'is encoded as JSON': function(buffer){
                    assert(JSON.parse(buffer.toString()));
                  },
                  '"Data" is encoded as base64': function(buffer){
                    var encData = new Buffer('foobarbaz').toString('base64');
                    assert.equal(JSON.parse(buffer.toString()).Data, encData);
                  }
                }
            }
        }

    }
}).export(module);
