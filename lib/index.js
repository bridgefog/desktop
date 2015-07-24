require.main.paths.splice(0, 0, process.env.NODE_PATH)

import ipc from 'ipc'
import remote from 'remote'

import React from 'react'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'

import _ from './ipc-dispatcher'
import DiscoveryService from './discovery'
import App from './components/app'
import trackActions from './actions/tracks'

var appDataDir = remote.require('./main-process/utils').appDataDir

var ipfsClient = new IPFSClient(ipfsUtil.ipfsEndpoint())

var discovery = new DiscoveryService({
  ipfsClient,
  releaseBasePath: appDataDir('releases'),
  onVerifiedRelease: releaseIPFSKey => {
    ipc.send('new-release-available', releaseIPFSKey)
  },
})

var trackBatchInterval = setInterval(() => {
  if (discovery.tracklist.latestBatch.isEmpty()) { return }
  trackActions.addMulti(discovery.tracklist.getAndFlushLatestBatch().toJS())
}, 500)

global.debug = {
  ipfsClient,
  discovery,
  trackBatchInterval,
  trackActions,
}

React.render(<App />, document.getElementById('content'))

discovery.start()
