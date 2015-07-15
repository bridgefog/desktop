import R from 'ramda'
import { assert } from 'chai'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'

import PubTree from '../../../lib/discovery/pub-tree'

var ipfsClient = new IPFSClient(ipfsUtil.ipfsEndpoint())

var release = { a: 1 }

var examples = {
  without_release: {
    tracks: [
      'QmfEV12XUpS44ZLmQYYASTvgL6xpEXUYCJRbqZvZnu9YA5',
      'QmfEn1XeRGL61ffJSZL4BcNWPJWZXNoB75P7efUV9XS3SQ',
      'QmfG32gtSmWUqe9uXz8YwxL2jeXm4ULNHVmLGLeJtwMkP4',
      'QmfGyWX6WCs9YectNbGoS66oR48uoXPBkL4CoTbgS4EDYJ',
      'QmfHpA5srxb8B5Nj1VxCuAdr393ijGqsJ8TKQzDnWYdiB6',
    ],
    peers: [
      'QmNTcg5JfybUvHydVUC9natmZDXT3Ctqwisgc8TAHJt1dF',
      'QmNd92Ndyccns8vTvdK66H1PC4qRXzKz3ewAqAzLbooEpB',
      'Qmf8oritrZdWRqUR62aDCwJvKKpoNwVGnVgJP2kB671RdA',
    ],
  }
}
examples.complete = R.merge(examples.without_release, { release: release })

describe('Discovery/PubTree', () => {
  describe('.fromIPFS', () => {
    before(() => {
      var promises = R.map(example => {
        return new PubTree(example)
          .addToIPFS(ipfsClient)
          .then(key => { example.key = key })
      }, R.values(examples))
      return Promise.all(promises)
    })

    describe('given an IPFS key referring to a PubTree DAG object', () => {
      context('which has all of `peers`, `tracks`, and `release`', () => {
        var example = examples.complete

        it('returns a new PubTree object', () => {
          return PubTree.fromIPFS(example.key, ipfsClient).then(pubTree => {
            assert.instanceOf(pubTree, PubTree)
            assert.deepEqual(pubTree.tracks, example.tracks)
            assert.deepEqual(pubTree.peers, example.peers)
            assert.deepEqual(pubTree.release, release)
          })
        })
      })
      context('which is missing the `release` link', () => {
        var example = examples.without_release

        it('returns a new PubTree object', () => {
          return PubTree.fromIPFS(example.key, ipfsClient).then(pubTree => {
            assert.instanceOf(pubTree, PubTree)
            assert.deepEqual(pubTree.tracks, example.tracks)
            assert.deepEqual(pubTree.peers, example.peers)
            assert.deepEqual(pubTree.release, null)
          })
        })
      })
    })
  })

  describe('#toIPFSTree()', () => {
    var pubTree
    var ipfsTree

    context('when has all of `peers`, `tracks`, and `release`', () => {
      before(() => {
        pubTree = new PubTree(examples.complete)
        ipfsTree = pubTree.toIPFSTree()
      })

      it('builds correct tree', () => {
        assert.isNull(ipfsTree.data)
        assert.deepEqual(ipfsTree.links.map(l => l[0]).toJS(), ['allthemusic'])
        var allthemusic = ipfsTree.links.first()[1]
        assert.isNull(allthemusic.data)
        assert.deepEqual(allthemusic.links.map(l => l[0]).toJS(), ['contents', 'peers', 'release'])
      })
    })

    context('when missing `release`', () => {
      before(() => {
        pubTree = new PubTree(examples.without_release)
        ipfsTree = pubTree.toIPFSTree()
      })

      it('builds correct tree', () => {
        assert.isNull(ipfsTree.data)
        assert.deepEqual(ipfsTree.links.map(l => l[0]).toJS(), ['allthemusic'])
        var allthemusic = ipfsTree.links.first()[1]
        assert.isNull(allthemusic.data)
        assert.deepEqual(allthemusic.links.map(l => l[0]).toJS(), ['contents', 'peers'])
      })
    })
  })
})
