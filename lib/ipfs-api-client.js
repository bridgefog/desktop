'use strict'

var url = require('url')
var util = require('util')
var debuglog = util.debuglog('ipfs');
var http = require('http')
var R = require('ramda')
var postForm = require('./http-post-form')

module.exports = function (ipfs_endpoint) {
  // always use the V0 api path prefix for now
  ipfs_endpoint = url.parse(url.resolve(ipfs_endpoint, '/api/v0/'))
  debuglog('ipfs_endpoint =>', ipfs_endpoint.href)

  function processJSONResponse(response) {
    if (response.contentType == 'application/json') {
      return JSON.parse(response.body)
    } else {
      return response.body
    }
  }

  function ipfsRequest(method, path, options) {
    var requestURL = url.parse(url.resolve(ipfs_endpoint, path))

    if (options && options.files) {
      return postForm(requestURL, options.files).then(processJSONResponse)
    }

    return new Promise(function (resolve, reject) {
      var request = http.request({
        hostname: requestURL.hostname,
        port: requestURL.port,
        path: requestURL.path,
        method: method
      })

      request.on('response', function (response) {
        var responseBody = ''

        // FIXME: This doesn't work in the browser... is this okay?
        // response.setEncoding('utf8')

        response.on('data', function (chunk) {
          responseBody += chunk
        })

        response.on('end', function () {
          if (response.statusCode === 200) {
            resolve({
              contentType: response.headers['content-type'],
              body: responseBody
            })
          } else {
            reject(new Error(
              util.format('[IPFS %s %s]: status = %s, body = `%s`',
                method,
                path,
                response.statusCode,
                responseBody)))
          }
        })
      })

      request.on('error', reject)

      request.end()
    }).then(processJSONResponse)
  }

  function peerID() {
    return ipfsRequest('GET', 'id').then(R.prop('ID'))
  }

  function nameResolve(peerId) {
    debuglog('nameResolve(%s)', peerId)

    var args = ''
    if (peerId) {
      args = '?arg=' + peerId
    }

    return ipfsRequest('GET', 'name/resolve' + args).then(function (response) {
      return response.Key
    })
  }

  function namePublish(value) {
    debuglog('namePublish(%s)', value)

    return ipfsRequest('GET', 'name/publish?arg=' + value)
  }

  function objectPut(dagNode) {
    var json = JSON.stringify(dagNode.asJSONforAPI())
    debuglog('objectAdd()', json)

    return ipfsRequest('POST', 'object/put?arg=json', {
      files: [{
        name: 'data',
        file: new Buffer(json),
      }]
    })
  }

  function objectGet(key) {
    debuglog('objectGet()', key)

    return ipfsRequest('GET', 'object/get?arg=' + key).then(function (object) {
      object.Data = new Buffer(object.Data, 'base64').toString('utf-8')
      return object
    })
  }

  function dhtFindprovs(contentID) {
    debuglog('dhtFindprovs()', contentID)

    return ipfsRequest('GET', 'dht/findprovs/' + contentID).then(function (result) {
      return result.Responses.map(function (response) { return response.ID })
    })
  }

  return {
    nameResolveSelf: function () {
      return nameResolve(null)
    },
    nameResolve: nameResolve,
    namePublish: namePublish,
    objectPut: objectPut,
    addObject: objectPut,
    objectGet: objectGet,
    peerID: peerID,
    dhtFindprovs: dhtFindprovs,
  }
}
