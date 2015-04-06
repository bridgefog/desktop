'use strict'

var expect = require('chai').expect
var Badge = require('../lib/badge')

describe('Badge', function () {
  describe('name calculation', function () {
    var now = Date.now()

    function subject(nameSpace) {
      return new Badge(nameSpace, now)
    }

    it('generates the correct string without a nameSpace', function () {
      expect(subject().name).to.
        eql('AllTheMusic:' + Math.round(now / (1000 * 60 * 60)))
    })

    it('generates the correct string with a nameSpace', function () {
      var namespace = 'search-term:Queen'
      expect(subject(namespace).name).to.
        eql('AllTheMusic:' + namespace + Math.round(now / (1000 * 60 * 60)))
    })
  })

  describe('dagObject', function () {
    it.skip('returns a DagObject with the data property set appropriately', function () {
    })
  })
})
