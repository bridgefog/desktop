import { debuglog } from 'util'

import { Set } from 'immutable'
import R from 'ramda'

import decorateHash from 'multihash-decorator'
import Swarm from './swarm'
import PubTree from './pub-tree'
import Tracklist from './tracklist'
import Updater from '../update/updater'
import trackActions from '../actions/tracks'

var log = debuglog('discovery')

class DiscoveryService {
  constructor({ ipfsClient, releaseBasePath, onVerifiedRelease }={}) {
    this.ipfsClient = ipfsClient
    this.tracklist = new Tracklist()
    this.swarm = new Swarm({
      ipfsClient,
      onKey: this.processNewPubTree.bind(this),
    })

    this.updater = new Updater({
      ipfsClient,
      basePath: releaseBasePath,
      onVerifiedRelease: onVerifiedRelease || Function(),
    })

    this.myPubTree = new PubTree()

    this.publishMyPubtree = this.publishMyPubtree.bind(this)
  }

  start() {
    this.swarm.start()
    // seed pubtree with whatever we had previously published (if anything)
    this.recallMyPreviousPubtree()
      .catch(() => false) // ignore errors. probably just a new IPFS node.
      .then(() => {
        // only set up the publish loop *after* we have resolved the previous
        // value to the name, otherwise we may corrupt this process.
        this.publishTimeout = setTimeout(this.publishMyPubtree, 5000)
      })
  }

  publishMyPubtree() {
    this.myPubTree.updatePeers(this.swarm.allPeerIDs())
    this.myPubTree.updateTracks(this.tracklist.knownIDs)
    this.myPubTree.release = this.updater.currentVerifiedRelease

    log('publishing!', {
      peers: this.myPubTree.peers.length,
      tracks: this.myPubTree.tracks.length,
      release: this.myPubTree.release,
    })
    return this.myPubTree.publish(this.ipfsClient)
      .then(key => {
        log(`published ${key} successfully`)
        this.publishTimeout = setTimeout(this.publishMyPubtree, 60000)
      })
      .catch(err => {
        log('error while publishing', err)
        this.publishTimeout = setTimeout(this.publishMyPubtree, 60000)
      })
  }

  processNewPubTree(key) {
    return PubTree.fromIPFS(key, this.ipfsClient).then(pubTree => {
      log(`rumor: ${key} -- ${pubTree.tracks.length} tracks, ${pubTree.peers.length} peers`)
      this.tracklist.fetchMulti(pubTree.tracks, this.ipfsClient)
      if (pubTree.release) {
        this.updater.tryRelease(pubTree.release)
      }
      this.swarm.addPeers(pubTree.peers)
    })
    .catch(err => {
      console.error(`Error while fetching PubTree ${key}`, err)
    })
  }

  recallMyPreviousPubtree() {
    return this.ipfsClient.nameResolveSelf()
      .then(key => {
        if (key) {
          log(`resolved previous pubTree to ${key}`)
          this.processNewPubTree(key)
        }
        return key
      })
      .catch(err => {
        log('error while attempting to resolve previous pubtree', err)
        throw(err)
      })
  }
}

export default DiscoveryService
