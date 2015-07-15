import util from 'util'

import devNull from 'dev-null'
import { Set } from 'immutable'
import R from 'ramda'

import decorateHash from '../hash-decorator'
import Swarm from './swarm'
import PubTree from './pub-tree'
import Tracklist from './tracklist'
import Updater from '../update/updater'
import trackActions from '../actions/tracks'

export default class DiscoveryService {
  constructor({ ipfsClient }={}) {
    this.ipfsClient = ipfsClient
    this.tracklist = new Tracklist()
    this.swarm = new Swarm({
      ipfsClient,
      onKey: this.processNewPubTree.bind(this),
    })
    this.updater = new Updater()
    this.sendBatchToTrackStore = this.sendBatchToTrackStore.bind(this)
    this.trackBatchInterval = setInterval(this.sendBatchToTrackStore, 500)
  }

  start() {
    this.swarm.start()
  }

  sendBatchToTrackStore() {
    trackActions.addMulti(this.tracklist.getAndFlushLatestBatch().toJS())
  }

  processNewPubTree(key) {
    return PubTree.fromIPFS(key, ipfsClient).then(pubTree => {
      this.updater.tryRelease(pubTree.release)
      this.tracklist.fetchMulti(pubTree.tracks, ipfsClient)
    })
  }
}
