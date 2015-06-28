import R from 'ramda'
import Track from '../upload/track'

// The idea here is a directory of music that will often have the same cover art.  Usually
// an album or release
class MusicCollection {
  constructor(filenames) {
    this.musicFilter = R.filter(name => name.endsWith('.mp3'))
    this.imageFilter = R.filter(name => name.endsWith('.jpg'))
    this.musicFiles = this.musicFilter(filenames)
    this.imageFiles = this.imageFilter(filenames)
    this.firstImage = this.imageFiles[0]
    this.addedMetadataKeys = []
  }

  addToIPFS() {
    return this.musicFiles.reduce((sequence, musicPath) => {
      return sequence.then(() => {
        var track = new Track(musicPath, this.firstImage)
        return track.addMetadataToIPFS().then(() => {
          this.addedMetadataKeys.push(track.metadataKey)
        })
      })
    }, Promise.resolve())
  }
}

export default MusicCollection
