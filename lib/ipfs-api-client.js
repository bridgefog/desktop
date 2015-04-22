'use strict'

import url from 'url'
import util from 'util'
import http from 'http'
import R from 'ramda'
import postForm from './http-post-form'
import { p } from './util'

var debuglog = util.debuglog('ipfs')

const dhtResponseTypes = {
  QueryEventType: 0,
  SendingQuery: 0,
  PeerResponse: 1,
  FinalPeer: 2,
  QueryError: 3,
  Provider: 4,
  Value: 5,
}

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

function ipfsRequest(method, requestURL, options) {
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
                        requestURL.path,
                        response.statusCode,
                        responseBody)))
        }
      })
    })

    request.on('error', reject)

    request.end()
  })
}

var appendUrl = R.compose(url.parse, url.resolve)

export default class IPFSClient {
  constructor(ipfsEndpoint) {
    // always use the V0 api path prefix for now
    this.ipfsEndpoint = appendUrl(ipfsEndpoint, '/api/v0/')
    debuglog('ipfsEndpoint =>', ipfsEndpoint.href)
  }

  requestURL(path) {
    return appendUrl(this.ipfsEndpoint, path)
  }

  peerID() {
    return ipfsRequest('GET', this.requestURL('id')).
      then(R.compose(R.prop('ID'), R.last))
  }

  nameResolve(peerId) {
    debuglog('nameResolve(%s)', peerId)

    var args = ''
    if (peerId) {
      args = '?arg=' + peerId
    }

    return ipfsRequest('GET', this.requestURL('name/resolve' + args)).
      then(R.compose(R.prop('Key'), R.last))
  }

  namePublish(value) {
    debuglog('namePublish(%s)', value)

    return ipfsRequest('GET', this.requestURL('name/publish?arg=' + value)).
      then(R.last)
  }

  objectPut(dagNode) {
    var json = JSON.stringify(dagNode.asJSONforAPI())
    debuglog('objectPut()', json)

    return ipfsRequest('POST', this.requestURL('object/put?arg=json'), {
      files: [{
        name: 'data',
        file: new Buffer(json),
      }]
    }).then(R.prop('Hash'))
  }

  objectGet(key) {
    debuglog('objectGet()', key)

    return ipfsRequest('GET', this.requestURL('object/get?arg=' + key)).
      then(R.last).
      then((object) => {
        object.Data = new Buffer(object.Data, 'base64').toString('utf-8')
        return object
      })
  }

  dhtFindprovs(contentID) {
    debuglog('dhtFindprovs()', contentID)

    var filter = R.filter(R.compose(R.eq(dhtResponseTypes.Provider), R.prop('Type')))

    return ipfsRequest('GET', this.requestURL('dht/findprovs/' + contentID)).
      then(R.compose(R.pluck('ID'), R.flatten, R.pluck('Responses'), filter))
  }

  nameResolveSelf() { return this.nameResolve(null) }
}
