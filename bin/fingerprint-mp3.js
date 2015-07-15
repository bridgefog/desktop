#!/usr/bin/env iojs

var fpcalc = require('fpcalc')

function fingerprintFile(filename) {
  console.time('fingerprinting: ' + filename)
  return new Promise(function (resolve, reject) {
    fpcalc(filename, function (err, result) {
      if (err) { reject(err) }
      console.log({
        filename: result.file,
        duration: result.duration,
        fingerprintLength: result.fingerprint.length,
        // fingerprint: result.fingerprint,
      })
      resolve(result)
      console.timeEnd('fingerprinting: ' + filename)
    })
  })
}

fingerprintFile(process.argv[2]).catch(function (err) {
  console.log(err.stack)
})
