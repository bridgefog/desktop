#!/usr/bin/env babel-node

'use strict'

import id3 from 'id3_reader'

function readMp3(filename) {
  return new Promise((resolve, reject) => {
    console.time('readMp3: ' + filename)
    id3.read(filename, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      if (data.attached_picture) { data.attached_picture = '[suppressed]' }
      console.log('allTags', data)
      resolve()
      console.timeEnd('readMp3: ' + filename)
    })
  })
}

readMp3(process.argv[2])
