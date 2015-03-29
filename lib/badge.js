'use strict'

var url = require('url')
var ipfs_endpoint = url.parse(process.env.ipfs_endpoint || process.env.npm_package_config_ipfs_endpoint)
var ipfs = require('../lib/ipfs-api-client')(ipfs_endpoint)
var DagObject = require('../lib/dag-object')

class Badge {

  currentName(now) {
    now = (typeof now === 'undefined') ? Date.now() : now
    var oneHourInMilliseconds = 1000 * 60 * 60
    return 'AllTheMusic:' + Math.round(now / oneHourInMilliseconds)
  }

  wear() {
    var dagNode = new DagObject({
      data: this.currentName()
    })

    this.currentId = ipfs.addObject(dagNode)
  }

  wearers() {
    // return ipfs.findProvs(this.currentId)
    return 'QmXYYGhut5ZTXGHeTqdvAHYxcMkPfwy85Dwsn4CAwKJPLb'
  }

}

module.exports = Badge
