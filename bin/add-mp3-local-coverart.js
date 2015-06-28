#!/usr/bin/env babel-node

'use strict'

import MusicCollection from '../lib/upload/music-collection'
import Contents from '../lib/contents'

var collection = new MusicCollection(process.argv.slice(2))

if (collection.musicFiles.length === 0) {
  console.error('ERROR: Supply one or more *.mp3 filename arguments')
  process.exit(1)
}

var contents = new Contents()

collection.addToIPFS().then(() => {
  return contents.publish(collection.addedMetadataKeys).then(newPublishedKey => {
    console.log('Published:', newPublishedKey)
  })
})

.catch(err => {
  console.log(err.stack)
})
