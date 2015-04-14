'use strict'

var url = require('url')
var util = require('util')
var debuglog = util.debuglog('ipfs');
var http = require('http')
var R = require('ramda')
var postForm = require('./http-post-form')

const dhtResponseTypes = {
  QueryEventType: 0,
  SendingQuery: 0,
  PeerResponse: 1,
  FinalPeer: 2,
  QueryError: 3,
  Provider: 4,
  Value: 5,
}

module.exports = function (ipfsEndpoint) {
  // always use the V0 api path prefix for now
  ipfsEndpoint = url.parse(url.resolve(ipfsEndpoint, '/api/v0/'))
  debuglog('ipfsEndpoint =>', ipfsEndpoint.href)

  function processJSONResponse(response) {
    if (responseIsJSON(response.contentType)) {
      try {
        return JSON.parse(response.body)
      } catch (e) {
        console.error('response.body =', response.body.toString())
        var error = new Error('Response is application/json but cannot be parsed.')
        error.original_error = e
        error.response_body = response.body
        throw(error)
      }
    } else {
      return response.body
    }
  }

  function responseIsJSON(contentType) {
    return contentType == 'application/json'
  }

  function responseIsChunked(response) {
    return response.headers['transfer-encoding'] == 'chunked'
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
        var responseObjects = []
        var contentType = response.headers['content-type']
        var chunked = responseIsChunked(response)

        // FIXME: This doesn't work in the browser... is this okay?
        // response.setEncoding('utf8')

        response.on('data', function (chunk) {
          if (chunked) {
            responseObjects.push(processJSONResponse({ contentType: contentType, body: chunk }))
          } else {
            responseBody += chunk
          }
        })

        response.on('end', function () {
          if (response.statusCode === 200) {
            if (chunked) {
              resolve(responseObjects)
            } else {
              resolve(processJSONResponse({ contentType: contentType, body: responseBody, }))
            }
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
    })
  }

  function peerID() {
    return ipfsRequest('GET', 'id').then(R.compose(R.prop('ID'), R.last))
  }

  function nameResolve(peerId) {
    debuglog('nameResolve(%s)', peerId)

    var args = ''
    if (peerId) {
      args = '?arg=' + peerId
    }

    return ipfsRequest('GET', 'name/resolve' + args).
      then(R.compose(R.prop('Key'), R.last))
  }

  function namePublish(value) {
    debuglog('namePublish(%s)', value)

    return ipfsRequest('GET', 'name/publish?arg=' + value).then(R.last)
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

    return ipfsRequest('GET', 'object/get?arg=' + key).
      then(R.last).
      then(function (object) {
      object.Data = new Buffer(object.Data, 'base64').toString('utf-8')
      return object
    })
  }

  function dhtFindprovs(contentID) {
    debuglog('dhtFindprovs()', contentID)

    var filter = R.filter(R.compose(R.eq(dhtResponseTypes.Provider), R.prop('Type')))

    return ipfsRequest('GET', 'dht/findprovs/' + contentID).
      then(R.compose(R.pluck('ID'), R.flatten, R.pluck('Responses'), filter))
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
