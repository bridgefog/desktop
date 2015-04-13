'use strict'

var url = require('url')
var path = require('path')
var httpProxy = require('http-proxy')

module.exports = function (config) {
  var apiEndpoint = 'http://' + config.host + ':' + config.apiPort
  var gatewayEndpoint = 'http://' + config.host + ':' + config.gatewayPort

  var proxy = httpProxy.createProxyServer({})
  proxy.on('error', function (err) {
    // silence errors
    // these are almost always disconenct errors
    if (config.errors) {
      console.error(err)
    }
  })

  return function (req, res, next) {
    if (typeof next != 'function') { next = function () {} }

    var p = path.normalize(url.parse(req.url).pathname).split('/')
    if (p[0].length === 0) {
      p.shift()
    }

    switch (p[0]) {
      case 'ipfs': {
        proxy.web(req, res, { target: gatewayEndpoint })
        break;
      }
      case 'api': {
        proxy.web(req, res, { target: apiEndpoint })
        break;
      }
      default: {
        next()
      }
    }
  }
}
