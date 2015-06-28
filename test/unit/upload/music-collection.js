import R from 'ramda'
import glob from 'glob'
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

  it('Finds first jpg in collection', () => {
    var filePaths = glob.sync('test/fixtures/collection/*')
    var collection = new MusicCollection(filePaths)
    var firstFixtureImage =
      'test/fixtures/collection/Circle-in-the-water-Wave-Rings_480x360.jpg'

    return assert.deepEqual(collection.firstImage, firstFixtureImage)
  })

  it('Returns falsey if no jpg in collection', () => {
    var filePaths = glob.sync('test/fixtures/not_a_path/*')
    var collection = new MusicCollection(filePaths)

    return assert(!collection.firstImage)
  })

  it('Syncronasly gets the fs size', () => {
    var filePaths = glob.sync('test/fixtures/collection/*')
    var collection = new MusicCollection(filePaths)
    var sizes = []

    return collection.musicFiles.reduce((sequence, musicPath) => {
      return sequence.then(() => {
        var track = new Track(musicPath)
        return track.readSize()
      }).then((size) => {
        sizes.push(size)
      })
    }, Promise.resolve()).then(() => {
      return assert.deepEqual([
        618295,
        1126621,
        587798,
        349728,
        875722,
        787154,
      ], sizes)
    })
  })
})
