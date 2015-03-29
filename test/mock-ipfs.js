'use strict'

var url = require('url')
var R = require('ramda')
var Stubby = require('stubby').Stubby

var mockIpfsEndpoint = url.parse('http://localhost:48130')

function IPFSMock(mockEndpoint, stubbyStartOptions) {
  this.stubbyStartOptions = R.merge({
    stubs: mockEndpoint.port,
    admin: 48131,
  }, stubbyStartOptions)
  this.stubby = new Stubby()
  this.endpoint = mockEndpoint
}

IPFSMock.prototype.start = function () {
  var self = this
  if (!this.startPromise) {
    this.startPromise = new Promise(function (resolve, reject) {
      self.stubby.start(self.stubbyStartOptions, function (error) {
        if (error) {
          reject(error)
        }
        resolve(self.stubby)
      })
    })
  }
  return this.startPromise
}

IPFSMock.prototype.mock = function (options) {
  return this.start().then(function (ipfsMock) {
    return new Promise(function (resolve, reject) {
      ipfsMock.post(options, function (error) {
        if (error) {
          reject(error)
        }
        resolve(ipfsMock)
      })
    })
  })
}

IPFSMock.prototype.reset = function () {
  return this.start().then(function (ipfsMock) {
    return new Promise(function (resolve, reject) {
      ipfsMock['delete'](function (error) {
        if (error) {
          reject(error)
        }
        resolve(ipfsMock)
      })
    })
  })
}

module.exports = new IPFSMock(mockIpfsEndpoint)
