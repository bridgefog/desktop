'use strict'

var util = require('util')
var debuglog = util.debuglog('ipfs');
var http = require('http')
var FormData = require('form-data')

module.exports = function (ipfs_endpoint) {
  function nameResolve(peerId, cb) {
    debuglog('nameResolve(%s)', peerId)

    var args = ''
    if (peerId) {
      args = '?arg=' + peerId
    }
    var request = http.request({
      hostname: ipfs_endpoint.hostname,
      port: ipfs_endpoint.port,
      path: ipfs_endpoint.path + '/name/resolve' + args,
      method: 'GET'
    })

    request.on('response', function (response) {
      var responseBody = ''
      response.setEncoding('utf8')

      response.on('data', function (chunk) {
        responseBody += chunk
      })

      response.on('end', function () {
        if (response.statusCode === 200) {
          cb(null, JSON.parse(responseBody).Key)
        } else {
          cb(new Error(responseBody), null)
        }
      })
    })

    request.on('error', function (e) {
      cb(e, null)
    })

    request.end()
  }

  function namePublish(value, cb) {
    debuglog('namePublish(%s)', value)

    var request = http.request({
      hostname: ipfs_endpoint.hostname,
      port: ipfs_endpoint.port,
      path: ipfs_endpoint.path + '/name/publish?arg=' + value,
      method: 'GET'
    })

    request.on('response', function (response) {
      var responseBody = ''
      response.setEncoding('utf8')

      response.on('data', function (chunk) {
        responseBody += chunk
      })

      response.on('end', function () {
        if (response.statusCode === 200) {
          cb(null)
        } else {
          cb(new Error(responseBody))
        }
      })
    })

    request.on('error', function (e) {
      cb(e, null)
    })

    request.end()
  }

  function addObject(dagNode, cb) {
    debuglog('addObject()', dagNode)

    var form = new FormData()
    form.append('data', dagNode.asJSONforAPI(), {
      filename: '_',
      contentType: 'application/json'
    })

    var request = http.request({
      hostname: ipfs_endpoint.hostname,
      port: ipfs_endpoint.port,
      path: ipfs_endpoint.path + '/object/put?arg=json',
      method: 'POST',
      headers: form.getHeaders()
    })
    request.on('response', function (res) {
      var responseBody = ''
      res.setEncoding('utf8')

      res.on('data', function (chunk) {
        responseBody += chunk
      })

      res.on('end', function () {
        if (res.statusCode !== 200) {
          cb(new Error(responseBody), null)
        } else {
          cb(null, JSON.parse(responseBody))
        }
      })
    })

    request.on('error', function (e) {
      cb(e, null)
    })

    form.pipe(request)

    request.end()
  }

  return {
    nameResolveSelf: function (cb) {
      nameResolve(null, cb)
    },
    nameResolve: nameResolve,
    namePublish: namePublish,
    addObject: addObject,
  }
}
