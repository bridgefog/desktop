import { debuglog } from 'util'

import devNull from 'dev-null'
import { Set } from 'immutable'
import R from 'ramda'

import decorateHash from '../hash-decorator'
import Swarm from './swarm'
import PubTree from './pub-tree'
import Tracklist from './tracklist'
import Updater from '../update/updater'
import trackActions from '../actions/tracks'

var log = debuglog('discovery')

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

    this.myPubTree = new PubTree()

    this.sendBatchToTrackStore = this.sendBatchToTrackStore.bind(this)
    this.publishMyPubtree = this.publishMyPubtree.bind(this)
  }

  start() {
    this.swarm.start()
    this.trackBatchInterval = setInterval(this.sendBatchToTrackStore, 500)
    this.publishTimeout = setTimeout(this.publishMyPubtree, 5000)
  }

  publishMyPubtree() {
    this.myPubTree.peers = this.swarm.allPeerIDs()
    this.myPubTree.release = this.updater.currentVerifiedRelease
    this.myPubTree.tracks = this.tracklist.knownIDs

    log('publishing!')
    console.log(this.myPubTree)
    return this.myPubTree.publish(this.ipfsClient)
      .then(() => {
        log('published successfully')
        this.publishTimeout = setTimeout(this.publishMyPubtree, 60000)
      })
      .catch(err => {
        log('error while publishing', err)
        this.publishTimeout = setTimeout(this.publishMyPubtree, 60000)
      })
  }

  sendBatchToTrackStore() {
    if (this.tracklist.latestBatch.isEmpty()) { return }
    console.log('sending tracks')
    trackActions.addMulti(this.tracklist.getAndFlushLatestBatch().toJS())
  }

  processNewPubTree(key) {
    return PubTree.fromIPFS(key, ipfsClient).then(pubTree => {
      this.tracklist.fetchMulti(pubTree.tracks, ipfsClient)
      if (pubTree.release) {
        this.updater.tryRelease(pubTree.release)
      }
      this.swarm.addPeers(pubTree.peers)
    })
  }
}

export default DiscoveryService
