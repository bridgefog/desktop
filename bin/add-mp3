#!/usr/bin/env babel-node

'use strict'

import { IPFSClient, DagObject, util as ipfsUtil } from 'atm-ipfs-api'
import childProcess from 'child_process'
import id3 from 'id3_reader'
import R from 'ramda'

var ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())

var filenames = process.argv.slice(2)
if (filenames.length == 0) {
  console.error('ERROR: Supply one or more filename arguments')
  process.exit(1)
}
console.log('filenames =', filenames)

var filterTags = R.pick([
  'artist',
  'title',
  'album',
  'genre',
  'track_number',
  'year',
  'publisher',
])

class Track{
  constructor(path, tags, image) {
    this.path = path
    this.tags = tags
    this.image = image
    this.ipfs_keys = {
      metadata: null,
      media: null,
    }
  }
}

function readMp3(filename) {
  return new Promise((resolve, reject) => {
    console.time('readMp3: ' + filename)
    id3.read(filename, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      var image = data.attached_picture
      var tags = filterTags(data)
      resolve(new Track(filename, tags, image))
      console.timeEnd('readMp3: ' + filename)
    })
  })
}

function ipfsAddFile(filename) {
  return new Promise((resolve, reject) => {
    console.time('ipfsAddFile: ' + filename)
    var output = ''
    var proc = childProcess.spawn('ipfs', ['add', '--quiet', filename], { stdio: ['inherit', 'pipe', 'inherit'] })
    proc.stdout.on('data', data => output += data.toString())
    proc.on('close', code => {
      if (code === 0) {
        resolve(output.trim())
      } else {
        console.log('exited ' + code)
        reject()
      }
      console.timeEnd('ipfsAddFile: ' + filename)
    })
  })
}

function buildMetadataNode(track) {
  var obj = new DagObject({ data: JSON.stringify(track.tags) })
    .addLink('file', track.ipfs_keys.media)
  console.log('metadata node', JSON.stringify(obj.asJSONforAPI()))
  return ipfs.objectPut(obj)
}

function addOneFile(filename) {
  var addFileP = ipfsAddFile(filename)
  var readTagsP = readMp3(filename)

  return Promise.all([readTagsP, addFileP])
    .then(([track, mediaNodeHash]) => {
      console.log(track.tags)
      if (track.image) {
        console.log('WARN: Track has embedded image asset; ignoring for now')
      }
      track.ipfs_keys.media = mediaNodeHash
      return track
    })
    .then(track => {
      console.log('ipfs_keys', track.ipfs_keys)
      return buildMetadataNode(track).then(hash => {
        console.log('added metadata node', hash)
        track.ipfs_keys.metadata = hash
        return track
      })
    })
    .catch(err => {
      console.error('ERROR:', err)
    })
}

Promise.all(filenames.map(filename => addOneFile(filename)))
  .then(tracks => {
    console.log("\n\nAll Tracks")
    tracks.forEach(track => console.log(track.ipfs_keys.metadata))

  })
