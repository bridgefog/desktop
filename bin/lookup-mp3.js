#!/usr/bin/env iojs

'use strict'

var acoustId = require('acoustid')

function lookup(filename) {
  return new Promise(function (resolve, reject) {
    acoustId(filename, { key: 'OomsDyzs' }, function (err, result) {
      if (err) { reject(err) }
      resolve(result)
    })
  })
}

lookup(process.argv[2])
  .catch(function (err) {
    console.log(JSON.stringify(err))
  })
  .then(function (result) {
    console.log(JSON.stringify(result))
  })
