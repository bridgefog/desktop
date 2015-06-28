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
    return track.readSize().then(() => assert.equal(track.size, 9398038))
  })

  it('Adds music file to IPFS and remembers its key', () => {
    return track.addMusicToIPFS().then(() => assert.deepEqual(track.musicKey, musicKey))
  })

  it('Adds image file to IPFS and remembers the key', () => {
    return track.addImageToIPFS().then(() => assert.deepEqual(track.imageKey, imageKey))
  })

  it('Creates metadata node', () => {
    var track = new Track(
      'test/fixtures/collection/Hammer-knocking-multiple-nail-into-a-plank-of-pine-wood.mp3',
      'test/fixtures/collection/Raindrops-on-Window-Glass-after-Rain__IMG_2950-580x386.jpg'
    )
    return track.addMetadataToIPFS().then(() => {
      // TODO: verify this key is correct
      assert.deepEqual(track.metadataKey, 'QmThKwEd9CaZYE6F7pjN7sVqJa7fqKShT2s4xvywxK6G8v')
    })
  })
})
