import id3 from 'id3_reader'
import R from 'ramda'
import fs from 'fs'
import childProcess from 'child_process'
import { IPFSClient, DagObject, util as ipfsUtil } from 'atm-ipfs-api'

var ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())

class Track {
  constructor(musicPath, imagePath) {
    this.musicPath = musicPath
    this.imagePath = imagePath
    this.tags = null
    this.size = 0
    this.chromaprint = null
    this.duration = null
    this.acoustid_track_id = null
    this.musicKey = 'no music key'
    this.imageKey = 'no image key'
    this.metadataKey = null
  }

  readSize() {
    return new Promise((resolve, reject) => {
      // console.time('stat: ' + this.musicPath)
      fs.stat(this.musicPath, (err, stat) => {
        if (err) { return reject(err) }
        this.size = stat.size
        resolve(this.size)
        // console.timeEnd('stat: ' + this.musicPath)
      })
    })
  }

  addImageToIPFS() {
    console.log('Adding:', this.imagePath)
    return this._addFileToIPFS(this.imagePath)
      .then((key) => this.imageKey = key)
  }

  addMusicToIPFS() {
    if (this.tags) {
      console.log('Adding:', this.tags.artist, this.tags.title)
    }
    return this._addFileToIPFS(this.musicPath)
      .then((key) => this.musicKey = key)
  }

  // yuck, fix me.
  addMetadataToIPFS() {
    return this.readSize().then(() => {
      return this.readTags().then(() => {
        return this.addImageToIPFS().then(() => {
          return this.addMusicToIPFS().then(() => {
            // console.log('tags', this.tags)
            var metadata = R.merge(this.tags, {
              duration: this.duration,
            })
            // console.log('metadata', this.musicPath, metadata)

            var obj = new DagObject({ data: JSON.stringify(metadata) })
            obj = obj.addLink('file', this.musicKey, this.size)
            obj = obj.addLink('image', this.imageKey)
            // console.log('metadata node', JSON.stringify(obj.asJSONforAPI()))
            return ipfs.objectPut(obj).then((metadataKey) => {
              this.metadataKey = metadataKey
            })
          })
        })
      })
    })
  }

  readTags() {
    return new Promise((resolve, reject) => {
      // console.time('readMp3: ' + this.musicPath)
      id3.read(this.musicPath, (err, data) => {
        if (err) { reject(err) ; return }

        this.attached_image = data.attached_picture
        this.tags = this.filterTags()(data)
        // resolve(new Track(this.musicPath, tags, image))
        resolve()
        // console.timeEnd('readMp3: ' + this.musicPath)
      })
    })
  }

  filterTags() {
    return R.pick([
      'artist',
      'title',
      'album',
      'genre',
      'track_number',
      'year',
      'publisher',
    ])
  }

  _addFileToIPFS(path) {
    return new Promise((resolve, reject) => {
      // console.time('ipfsAddFile: ' + path)
      var output = ''
      var proc = childProcess.spawn(
        'ipfs', ['add', '--quiet', path], { stdio: ['inherit', 'pipe', 'inherit'] }
      )
      proc.stdout.on('data', data => output += data.toString())
      proc.on('close', code => {
        if (code === 0) {
          resolve(output.trim())
        } else {
          console.log('exited ' + code)
          reject()
        }
        // console.timeEnd('ipfsAddFile: ' + path)
      })
    })
  }
}

export default Track
