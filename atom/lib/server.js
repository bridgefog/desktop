'use strict'

var http = require('http')
var st = require('st')
var ipfsStatic = require('./ipfs-proxy')

module.exports = function (config) {
  console.log(config)
  this.config = config

  var ipfsStaticServer = ipfsStatic(config.ipfs)
  var staticServer = st({
    path: config.rootDir,
    url: '/',
    cache: false,
    index: true,
    dot: false,
    passthrough: true,
    gzip: false,
  })

  this.server = http.Server(function (req, res) {
    ipfsStaticServer(req, res, function () {
      staticServer(req, res)
    })
  }).listen(config.port, function () {
    var host = this.address().address
    var port = this.address().port

    console.log('Server listening at http://%s:%s', host, port)
  })
}
