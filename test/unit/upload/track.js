import { assert } from 'chai'
import Track from '../../../lib/upload/track'

// QmSYhvNcdzQ4Qqdmx38BMu9J759hVnMajefMUyKzjs2Ua1
// test/fixtures/MLKDream.mp3
// ipfs add MLK.jpg
// added QmVUaz5ActFDKkPSxvKw1gUZCS2ZjVe8L6M7fTXtXxHB6j MLK.jpg

describe('Track', () => {
  var track = new Track('test/fixtures/MLKDream.mp3', 'test/fixtures/MLK.jpg')
  var musicKey = 'QmSYhvNcdzQ4Qqdmx38BMu9J759hVnMajefMUyKzjs2Ua1'
  var imageKey = 'QmVUaz5ActFDKkPSxvKw1gUZCS2ZjVe8L6M7fTXtXxHB6j'

  it('Reads its own size', () => {
    return track.readSize().then((size) => assert.equal(size, 9398038))
  })

  it('Adds music file to IPFS and remembers its key', () => {
    return track.addMusicToIPFS().then(() => assert.deepEqual(track.musicKey, musicKey))
  })

  it('Adds image file to IPFS and remembers the key', () => {
    return track.addImageToIPFS().then(() => assert.deepEqual(track.imageKey, imageKey))
  })

})
