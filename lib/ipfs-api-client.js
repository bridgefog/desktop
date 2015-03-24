'use strict'

var util = require('util')
var debuglog = util.debuglog('ipfs');
var http = require('http')
var FormData = require('form-data')

module.exports = function (ipfs_endpoint) {
  debuglog('ipfs_endpoint =>', ipfs_endpoint.href)

  function nameResolve(peerId) {
    return new Promise(function (resolve, reject) {
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
            resolve(JSON.parse(responseBody).Key)
          } else {
            reject(new Error(responseBody))
          }
        })
      })

      request.on('error', function (e) {
        reject(e)
      })

      request.end()
    })
  }

  function namePublish(value) {
    return new Promise(function (resolve, reject) {
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
            resolve()
          } else {
            reject(new Error(responseBody))
          }
        })
      })

      request.on('error', function (e) {
        reject(e)
      })

      request.end()
    })
  }

  function addObject(dagNode) {
    return new Promise(function (resolve, reject) {
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
          if (res.statusCode === 200) {
            resolve(JSON.parse(responseBody))
          } else {
            reject(new Error(responseBody))
          }
        })
      })

      request.on('error', function (e) {
        reject(e)
      })

      form.pipe(request)

      request.end()
    })
  }

  return {
    nameResolveSelf: function () {
      return nameResolve(null)
    },
    nameResolve: nameResolve,
    namePublish: namePublish,
    addObject: addObject,
  }
}
