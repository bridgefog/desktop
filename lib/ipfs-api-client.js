'use strict'

var util = require('util')
var debuglog = util.debuglog('ipfs');
var http = require('http')
var FormData = require('form-data')

module.exports = function (ipfs_endpoint) {
  debuglog('ipfs_endpoint =>', ipfs_endpoint.href)

  function ipfsRequest(method, path, options) {
    return new Promise(function (resolve, reject) {
      var form

      var requestOptions = {
        hostname: ipfs_endpoint.hostname,
        port: ipfs_endpoint.port,
        path: ipfs_endpoint.path + path,
        method: method
      }

      if (options && options.files) {
        form = new FormData()

        options.files.every(function (file) {
          form.append(file.name, file.file, {
            filename: '_',
            contentType: 'application/json'
          })
        })

        requestOptions.headers = form.getHeaders()
      }

      var request = http.request(requestOptions)

      request.on('response', function (response) {
        var responseBody = ''
        response.setEncoding('utf8')

        response.on('data', function (chunk) {
          responseBody += chunk
        })

        response.on('end', function () {
          if (response.statusCode === 200) {
            resolve(JSON.parse(responseBody))
          } else {
            reject(new Error(
              util.format('[IPFS %s %s]: status = %s, body = `%s`',
                method,
                requestOptions.path,
                response.statusCode,
                responseBody)))
          }
        })
      })

      request.on('error', function (e) {
        reject(e)
      })

      if (form) {
        form.pipe(request)
      }

      request.end()
    })
  }

  function peerID() {
    return ipfsRequest('GET', '/id').then(function (response) {
      return response.ID
    })
  }

  function nameResolve(peerId) {
    debuglog('nameResolve(%s)', peerId)

    var args = ''
    if (peerId) {
      args = '?arg=' + peerId
    }

    return ipfsRequest('GET', '/name/resolve' + args).then(function (response) {
      return response.Key
    })
  }

  function namePublish(value) {
    debuglog('namePublish(%s)', value)

    return ipfsRequest('GET', '/name/publish?arg=' + value).then(function () {
      return null
    })
  }

  function addObject(dagNode) {
    debuglog('addObject()', dagNode)

    return ipfsRequest('POST', '/object/put?arg=json', {
      files: [{
        name: 'data',
        file: dagNode.asJSONforAPI(),
      }]
    })
  }

  return {
    nameResolveSelf: function () {
      return nameResolve(null)
    },
    nameResolve: nameResolve,
    namePublish: namePublish,
    addObject: addObject,
    peerID: peerID,
  }
}
