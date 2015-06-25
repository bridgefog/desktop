import R from 'ramda'
import { assert } from 'chai'
import MusicCollection from '../../../lib/upload/music-collection'
import Track from '../../../lib/upload/track'

describe('MusicCollection', () => {
  it('Filters a list of filenames into music and images', () => {
    var filenames = [
      '/foo/bar/track1.mp3',
      '/foo/bar/track2.mp3',
      '/foo/bar/image1.jpg',
      '/foo/bar/image2.jpg',
      '/foo/bar/something.else',
    ]
    var collection = new MusicCollection(filenames)
    var musics = ['/foo/bar/track1.mp3', '/foo/bar/track2.mp3']
    var images = ['/foo/bar/image1.mp3', '/foo/bar/image2.mp3']

    return assert.deepEqual(collection.musicFiles, musics)
    return assert.deepEqual(collection.imageFiles, images)
  })

  it('Syncronasly gets the fs size', () => {
    var filePaths = '../../fixtures/collection/*'
    var collection = new MusicCollection(filePaths)
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!')
    console.log(collection.musicFiles)

    var sizes = []
    return collection.musicFiles.reduce((sequence, musicPath) => {
      return sequence.then(() => {
        console.log('path', musicPath)
        var track = new Track(musicPath)
        return track.readSize()
      }).then((size) => {
        sizes.push(size)
        console.log('size', size)
      })
    }, Promise.resolve()).then(() => {
      return assert.deepEqual(sizes, [])
    })
  })
})
