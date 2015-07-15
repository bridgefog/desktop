#!/usr/bin/env babel-node

import MusicCollection from '../lib/upload/music-collection'
import Contents from '../lib/contents'
import glob from 'glob'

var filenames = glob.sync(process.argv[2] + '/*')
var collection = new MusicCollection(filenames)

if (collection.musicFiles.length === 0) {
  console.error('ERROR: No music found.')
  process.exit(1)
}

if (collection.imageFiles.length === 0) {
  console.error('ERROR: No cover art found')
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
