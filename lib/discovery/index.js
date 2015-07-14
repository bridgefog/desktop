import util from 'util'

import devNull from 'dev-null'
import { Set } from 'immutable'
import R from 'ramda'

import decorateHash from '../hash-decorator'
import Swarm from './swarm'
import Tracklist from './tracks'

export default class DiscoveryService {
  constructor({ ipfsClient }) {
    this.tracklist = new Tracklist()
    this.swarm = new Swarm({
      ipfsClient,
      onKey: (key) => {
      },
    })
  }

  start() {
    this.swarm.start()
  }
}
