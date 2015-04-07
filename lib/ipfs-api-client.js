'use strict'

var url = require('url')
var util = require('util')
var debuglog = util.debuglog('ipfs');
var http = require('http')
var R = require('ramda')
var postForm = require('./http-post-form')

module.exports = function (ipfsEndpoint) {
  // always use the V0 api path prefix for now
  ipfsEndpoint = url.parse(url.resolve(ipfsEndpoint, '/api/v0/'))
  debuglog('ipfsEndpoint =>', ipfsEndpoint.href)

  function processJSONResponse(response) {
    if (response.contentType == 'application/json') {
      return JSON.parse(response.body)
    } else {
      return response.body
    }
  }

  function ipfsRequest(method, path, options) {
    var requestURL = url.parse(url.resolve(ipfsEndpoint, path))

    if (options && options.files) {
      return postForm(requestURL, options.files).then(processJSONResponse)
    }

    return new Promise(function (resolve, reject) {
      var request = http.request({
        hostname: requestURL.hostname,
        port: requestURL.port,
        path: requestURL.path,
        method: method,
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
              body: responseBody,
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

    return ipfsRequest('GET', 'name/resolve' + args).
      then(R.prop('Key'))
  }

  function namePublish(value) {
    debuglog('namePublish(%s)', value)

    return ipfsRequest('GET', 'name/publish?arg=' + value)
  }

  function objectPut(dagNode) {
    var json = JSON.stringify(dagNode.asJSONforAPI())
    debuglog('objectPut()', json)

    return ipfsRequest('POST', 'object/put?arg=json', {
      files: [{
        name: 'data',
        file: new Buffer(json),
      }]
    }).then(R.prop('Hash'))
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

    return ipfsRequest('GET', 'dht/findprovs/' + contentID).
      then(R.compose(R.pluck('ID'), R.prop('Responses')))
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
