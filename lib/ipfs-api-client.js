'use strict'

import url from 'url'
import util from 'util'
import http from 'http'
import R from 'ramda'
import split from 'split2'
import concat from 'concat-stream'
import through from 'through2'
import postForm from './http-post-form'
import { concatP } from './util'

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

function fixChunkAfterSplit(chunk) {
  var prefix = ''
  var postfix = ''
  if (chunk.substring(0, 1) != '{') {
    prefix = '{'
  }
  if (chunk.substring(chunk.length - 1) != '}') {
    postfix = '}'
  }
  return prefix + chunk + postfix
}

// some IPFS API responses are many JSON objects concatenated together; as far
// as I can tell, this is the best way to parse this without writing a parser
function parseConcatenatedJSON() {
  return split('}{', R.compose(JSON.parse, fixChunkAfterSplit), { objectMode: true })
}

function responseIsJSON(contentType) {
  return contentType == 'application/json'
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

    request.on('response', function (_response) {
      var response = _response
      if (responseIsJSON(_response.headers['content-type'])) {
        response = response.pipe(parseConcatenatedJSON())
      }
      if (_response.statusCode == 200) {
        resolve(response)
      } else {
        response.pipe(concat((body) => {
          var e = new Error(util.format('[IPFS %s %s]: status = %s, body = %s',
                                        method, requestURL.path, response.statusCode, JSON.stringify(body)))
          reject(e)
        }))
      }
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
    return ipfsRequest('GET', this.requestURL('id'))
      .then(concatP)
      .then(R.compose(R.prop('ID'), R.last))
  }

  nameResolve(peerId) {
    debuglog('nameResolve(%s)', peerId)

    var args = ''
    if (peerId) {
      args = '?arg=' + peerId
    }

    return ipfsRequest('GET', this.requestURL('name/resolve' + args))
      .then(concatP)
      .then(R.compose(R.prop('Key'), R.last))
  }

  namePublish(value) {
    debuglog('namePublish(%s)', value)

    return ipfsRequest('GET', this.requestURL('name/publish?arg=' + value))
      .then(concatP)
      .then(R.last)
  }

  objectPut(dagNode) {
    var json = JSON.stringify(dagNode.asJSONforAPI())
    debuglog('objectPut()', json)
    var opts = {
      files: [{
        name: 'data',
        file: new Buffer(json),
      }]
    }

    return ipfsRequest('POST', this.requestURL('object/put?arg=json'), opts)
      // .then(concatP)
      // .then(R.compose(R.prop('Hash'), R.last))
      .then(R.compose(R.prop('Hash')))
  }

  objectGet(key) {
    debuglog('objectGet()', key)

    return ipfsRequest('GET', this.requestURL('object/get?arg=' + key))
      .then(concatP)
      .then(R.last)
      .then((object) => {
        object.Data = new Buffer(object.Data, 'base64').toString('utf-8')
        return object
      })
  }

  dhtFindprovs(contentID) {
    debuglog('dhtFindprovs()', contentID)

    var transform = (response) => {
      return response.pipe(through.obj(function (chunk, enc, cb) {
        if (chunk.Type == dhtResponseTypes.Provider) {
          chunk.Responses.forEach(res => this.push(res))
        }
        cb()
      }))
    }

    return ipfsRequest('GET', this.requestURL('dht/findprovs/' + contentID))
      .then(transform)
  }

  nameResolveSelf() { return this.nameResolve(null) }
}
