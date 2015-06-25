import R from 'ramda'

// The idea here is a directory of music that will often have the same cover art.  Usually
// an album or release
class MusicCollection {
  constructor(filenames) {
    this.musicFilter = R.filter(name => name.endsWith('.mp3'))
    this.imageFilter = R.filter(name => name.endsWith('.jpg'))
    this.musicFiles = this.musicFilter(filenames)
    this.imageFiles = this.imageFilter(filenames)
  }
}

export default MusicCollection
