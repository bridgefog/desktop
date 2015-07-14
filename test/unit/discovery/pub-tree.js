import { assert } from 'chai'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'

import PubTree from '../../../lib/discovery/pub-tree'

var ipfsClient = new IPFSClient(ipfsUtil.ipfsEndpoint())

var examples = {
  complete: {
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

describe('Discovery/PubTree', () => {
  describe('.fromIPFS', () => {
    before(() => {
      return new PubTree(examples.complete)._addToIPFS(ipfsClient).then(key => {
        examples.complete.key = key
      })
    })

    describe('given an IPFS key referring to a PubTree DAG object', () => {
      it('returns a new PubTree object', () => {
        return PubTree.fromIPFS(examples.complete.key, ipfsClient).then(pubTree => {
          assert.instanceOf(pubTree, PubTree)
          assert.deepEqual(pubTree.tracks, examples.complete.tracks)
        })
      })
    })
  })
})
