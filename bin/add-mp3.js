#!/usr/bin/env babel-node

'use strict'

import childProcess from 'child_process'
import fs from 'fs'
import fpcalc from 'fpcalc'
import id3 from 'id3_reader'
import R from 'ramda'
import { Set } from 'immutable'
import { IPFSClient, DagObject, util as ipfsUtil } from 'atm-ipfs-api'
import Clubnet from '../lib/clubnet'
import Badge from '../lib/badge'

var filterFilenames = R.filter(name => name.endsWith('.mp3'))

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
    this.size = 0
    this.chromaprint = null
    this.duration = null
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

function fingerprintFile(filename) {
  console.time('fingerprinting: ' + filename)
  return new Promise(function (resolve, reject) {
    fpcalc(filename, function (err, result) {
      if (err) { reject(err) }
      // console.log({
      //   filename: result.file,
      //   duration: result.duration,
      //   fingerprintLength: result.fingerprint.length,
      //   fingerprint: result.fingerprint,
      // })
      resolve(result)
      console.timeEnd('fingerprinting: ' + filename)
    })
  })
}


function getFileSize(filename) {
  return new Promise((resolve, reject) => {
    console.time('stat: ' + filename)
    fs.stat(filename, (err, stat) => {
      if (err) { return reject(err) }
      resolve(stat.size)
      console.timeEnd('stat: ' + filename)
    })
  })
}

function ipfsAddFile(filename) {
  return new Promise((resolve, reject) => {
    // console.time('ipfsAddFile: ' + filename)
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
      // console.timeEnd('ipfsAddFile: ' + filename)
    })
  })
}

function buildMetadataNode(track) {
  var metadata = R.merge(track.tags, {
    fingerprints: {
      chromaprint: track.chromaprint,
    },
    duration: track.duration,
  })
  console.log('metadata', track.filename, metadata)

  var obj = new DagObject({ data: JSON.stringify(metadata) })
  obj = obj.addLink('file', track.ipfs_keys.media, track.size)
  // console.log('metadata node', JSON.stringify(obj.asJSONforAPI()))
  return ipfs.objectPut(obj)
}

function addOneFile(filename) {
  var addFileP = ipfsAddFile(filename)
  var readTagsP = readMp3(filename)
  var fileSizeP = getFileSize(filename)
  var fingerprintP = fingerprintFile(filename)

  return Promise.all([readTagsP, addFileP, fileSizeP, fingerprintP])
    .then(([track, mediaNodeHash, size, fpResult]) => {
      // console.log(track.tags)
      // if (track.image) {
      //   console.log('WARN: Track has embedded image asset; ignoring for now')
      // }
      track.size = size
      track.ipfs_keys.media = mediaNodeHash
      track.chromaprint = fpResult.fingerprint
      track.duration = parseInt(fpResult.duration)
      return track
    })
    .then(track => {
      // console.log('ipfs_keys', track.ipfs_keys)
      return buildMetadataNode(track).then(hash => {
        // console.log('added metadata node', hash)
        track.ipfs_keys.metadata = hash
        return track
      })
    })
    .catch(err => {
      console.error('ERROR:', err)
    })
}

function addDirectoryTree(contents) {
  // console.time('addDirectoryTree')
  var addLink = (contentsNode, key) => contentsNode.addLink('', key)
  var contentsNode = R.reduce(addLink, new DagObject(), contents)
  return ipfs.objectPut(contentsNode)
    .then(contentsNodeHash => ipfs.objectPut(new DagObject().addLink('contents', contentsNodeHash)))
    .then(atmNodeHash => ipfs.objectPut(new DagObject().addLink('allthemusic', atmNodeHash)))
    .then(finalHash => {
      // console.timeEnd('addDirectoryTree')
      return finalHash
    })
}

function getCurrentContents() {
  return ipfs.nameResolveSelf()
    .then(publishedKey => ipfs.objectGet(publishedKey + '/allthemusic/contents'))
    .then(contentsNode => R.pluck('Hash', contentsNode.Links))
    .catch(err => {
      console.error('Failed to resolve current published contents')
      console.error(err.stack)
      return []
    })
}

var ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())
var clubnet = new Clubnet(ipfs, () => new Badge())

var filenames = filterFilenames(process.argv.slice(2))
if (filenames.length === 0) {
  console.error('ERROR: Supply one or more *.mp3 filename arguments')
  process.exit(1)
}
// console.log('filenames =', filenames)

Promise.all(filenames.map(filename => addOneFile(filename)))
  .then(tracks => {
    if (tracks.length === 0) { return }
    // console.log('\n\nAll Tracks')
    var newTrackKeys = R.compose(R.pluck('metadata'), R.pluck('ipfs_keys'))(tracks)
    // console.log(newTrackKeys)

    console.log('Republishing...')
    console.time('republishing')
    return clubnet.wearBadge()
      .then(getCurrentContents)
      .then(contents => {
        var newContents = new Set(contents).union(newTrackKeys).toJS()
        return addDirectoryTree(newContents)
      })
      .then(newKey => ipfs.namePublish(newKey))
      .then(() => console.timeEnd('republishing'))
      .catch(e => {
        console.error('ERROR', e.stack)
      })
  })
  .catch(e => {
    console.error('ERROR', e.stack)
  })
