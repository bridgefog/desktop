import { assert } from 'chai'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'
import { Set } from 'immutable'

import Tracklist from '../../../lib/discovery/tracklist'

var ipfsClient = new IPFSClient(ipfsUtil.ipfsEndpoint())

describe('Tracklist', () => {
  var subject
  beforeEach(() => {
    subject = new Tracklist()
  })

  describe('#knownIDs', () => {
    it('is a Set', () => {
      assert.instanceOf(subject.knownIDs, Set)
    })
  })

  describe('#fetchTrack()', () => {
    var id
    beforeEach(() => {
      id = 'QmfEV12XUpS44ZLmQYYASTvgL6xpEXUYCJRbqZvZnu9YA5'
    })

    it('it marks track IDs in progress during fetch, removes them after', () => {
      assert(!subject.inProgressIDs.has(id), 'not in progress before')
      var promise = subject.fetchTrack(id, ipfsClient)
      assert(subject.inProgressIDs.has(id), 'in progress during')
      return promise.then(() => {
        assert(!subject.inProgressIDs.has(id), 'not in progress after')
      })
    })

    it('it marks track IDs in progress during fetch, removes them even after error', () => {
      id = 'QmNotAFetchableHash'
      assert(!subject.inProgressIDs.has(id), 'not in progress before')
      var promise = subject.fetchTrack(id, ipfsClient)
      assert(subject.inProgressIDs.has(id), 'in progress during')
      return promise.catch(() => {
        assert(!subject.inProgressIDs.has(id), 'not in progress after')
      })
    })

    it('results in track being given to #addTrack()', () => {
      return subject.fetchTrack(id, ipfsClient).then(() => {
        assert(subject.knownIDs.has(id), 'knownIDs has ID')
      })
    })

    for (var idCollection of (['knownIDs', 'inProgressIDs'])) {
      it(`it skips tracks which are already in ${idCollection}`, () => {
        disableMethod(subject, 'addTrack')
        disableMethod(subject, '_trackInProgress')

        subject[idCollection] = subject[idCollection].add(id)
        return subject.fetchTrack(id, ipfsClient)
      })
    }

    it('adds new tracks to the latestBatch', () => {
      assert.equal(subject.latestBatch.count(), 0)
      return subject.fetchTrack(id, ipfsClient).then(() => {
        assert.equal(subject.latestBatch.count(), 1)
      })
    })
  })

  describe('#getAndFlushLatestBatch()', () => {
    it('returns the current latestBatch', () => {
      var batch = subject.latestBatch = Set.of([1, 2, 3])
      assert.deepEqual(subject.getAndFlushLatestBatch(), batch)
    })

    it('empties the latestBatch', () => {
      subject.latestBatch = Set.of([1, 2, 3])
      subject.getAndFlushLatestBatch()
      assert.equal(subject.latestBatch.count(), 0)
    })
  })

  describe('#fetchMulti()', () => {
    it('appends given items to the internal trackIDs set', () => {
      assert(subject.knownIDs.isEmpty())
      var newSet = [
        'QmfEV12XUpS44ZLmQYYASTvgL6xpEXUYCJRbqZvZnu9YA5',
        'QmfEn1XeRGL61ffJSZL4BcNWPJWZXNoB75P7efUV9XS3SQ',
      ]
      return subject.fetchMulti(newSet, ipfsClient).then(() => {
        assert(subject.knownIDs.has(newSet[0]))
        assert(subject.knownIDs.has(newSet[1]))
      })
    })
  })
})

function disableMethod(obj, methodName) {
  obj[methodName] = () => {
    throw new Error(`${methodName} was called!`)
  }
}
