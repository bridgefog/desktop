<<<<<<< HEAD
var url = require('url')
||||||| merged common ancestors
'use strict'

var url = require('url')
=======
'use strict'

>>>>>>> 6a38551881839a93ada970f7e962686242faffdc
var expect = require('chai').expect
var Badge = require('../lib/badge')
<<<<<<< HEAD
var ipfs_endpoint = url.parse(
  process.env.ipfs_endpoint || process.env.npm_package_config_ipfs_endpoint
)
var ipfs = require('../lib/ipfs-api-client')(ipfs_endpoint)
||||||| merged common ancestors
var ipfs_endpoint = url.parse(
    process.env.ipfs_endpoint || process.env.npm_package_config_ipfs_endpoint
)
var ipfs = require('../lib/ipfs-api-client')(ipfs_endpoint)
=======
  // var ipfsEndpoint = require('../lib/util').ipfsEndpoint
  // var ipfs = require('../lib/ipfs-api-client')(ipfsEndpoint())
>>>>>>> 6a38551881839a93ada970f7e962686242faffdc

describe('Badge', function () {
  describe('currentName', function () {
    var now = Date.now()

    function subject() {
      return new Badge().currentName(now)
    }

    it('returns the current string to be hashed into a badge', function () {
      expect(subject()).to.eql('AllTheMusic:' + Math.round(now / (1000 * 60 * 60)))
    })
  })

  describe('wear', function () {
    it('publishes badge', function () {
      var badge = new Badge()
      badge.wear()

      return ipfs.peerID().then(function (peerID) {
        expect(badge.wearers()).to.include(peerID)
      })
    })
  })
})
