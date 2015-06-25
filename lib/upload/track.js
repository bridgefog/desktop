import id3 from 'id3_reader'
import fs from 'fs'
import childProcess from 'child_process'

class Track {
  constructor(musicPath, imagePath) {
    this.musicPath = musicPath
    this.imagePath = imagePath
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
        resolve(stat.size)
        // console.timeEnd('stat: ' + this.musicPath)
      })
    })
  }

  addImageToIPFS() {
    return this._addFileToIPFS(this.imagePath)
      .then((key) => this.imageKey = key)
  }

  addMusicToIPFS() {
    return this._addFileToIPFS(this.musicPath)
      .then((key) => this.musicKey = key)
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

  read() {
    return new Promise((resolve, reject) => {
      console.time('readMp3: ' + this.musicPath)
      id3.read(this.musicPath, (err, data) => {
        if (err) { reject(err) ; return }

        this.attached_image = data.attached_picture
        this.tags = filterTags(data)
        resolve(new Track(this.musicPath, tags, image))
        console.timeEnd('readMp3: ' + musicPath)
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
}

export default Track
