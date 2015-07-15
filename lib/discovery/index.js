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

class DiscoveryService {
  constructor({ ipfsClient, releaseBasepath, onVerifiedRelease }={}) {
    this.ipfsClient = ipfsClient
    this.tracklist = new Tracklist()
    this.swarm = new Swarm({
      ipfsClient,
      onKey: this.processNewPubTree.bind(this),
    })

    this.updater = new Updater({
      ipfsClient,
      basepath: releaseBasepath,
      onVerifiedRelease: onVerifiedRelease || Function(),
    })
    this.sendBatchToTrackStore = this.sendBatchToTrackStore.bind(this)
  }

  start() {
    this.swarm.start()
    this.trackBatchInterval = setInterval(this.sendBatchToTrackStore, 500)
  }

  sendBatchToTrackStore() {
    if (this.tracklist.latestBatch.isEmpty()) { return }
    console.log('sending tracks')
    trackActions.addMulti(this.tracklist.getAndFlushLatestBatch().toJS())
  }

  processNewPubTree(key) {
    return PubTree.fromIPFS(key, ipfsClient).then(pubTree => {
      if (pubTree.release) { this.updater.tryRelease(pubTree.release) }
      this.tracklist.fetchMulti(pubTree.tracks, ipfsClient)
    })
  }
}

export default DiscoveryService
