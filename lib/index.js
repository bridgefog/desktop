require.main.paths.splice(0, 0, process.env.NODE_PATH)

import util from 'util'

import { Set } from 'immutable'
import React from 'react'
import R from 'ramda'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'

import _ from './ipc-dispatcher'
import Clubnet from './clubnet'
import Badge from './badge'
import trackActions from './actions/tracks'
import { Peer } from './stores/peer-store'
import decorateHash from './hash-decorator'
import App from './components/app'

var publishedKeys = new Set()

function handleError(scope) {
  return function (err) {
    if (!err) { return }
    console.log('ERROR [%s]', scope)
    if (err instanceof Error) {
      console.log(err.stack)
    } else {
      console.log(err)
    }
  }
}

function log() {
  console.log(util.format.apply(util, arguments))
}

function getPeers() {
  clubnet.findPeers().then(() => {
    setTimeout(getPeers, 9000)
  }).catch(e => {
    handleError('getPeers')(e)
    setTimeout(getPeers, 9000)
  })
}

var knownTracks = []
var tracksToUpdate = []

function updateTracks() {
  if (tracksToUpdate.length > 0) {
    trackActions.addMulti(tracksToUpdate)
    tracksToUpdate = []
  }
  setTimeout(updateTracks, 500)
}

function fetchPeersContents(thisPeersContents) {
  var contents = new Set().union(R.pluck('Hash', thisPeersContents.Links))

  contents.forEach(id => {
    if (knownTracks.indexOf(id) < 0) {
      knownTracks.push(id)
      ipfs.objectGet(id)
        .then(object => {
          var metadata = JSON.parse(object.Data)
          metadata.id = id
          metadata.links = {}
          object.Links.forEach(link => {
            metadata.links[link.Name] = link.Hash
          })
          tracksToUpdate.push(metadata)
        })
        .catch(handleError('fetchPeersContents(id=' + id + ')'))
    }
  })
}

var ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())
var clubnet = new Clubnet(ipfs, () => new Badge())

var getMyID = ipfs.peerID().catch(handleError('getMyID'))
getMyID.then(myID => clubnet.addPeer(myID))

function decoratePeerID(peerID) {
  var dPeerID = decorateHash(peerID)
  return getMyID
    .then(myID => '[' + (peerID === myID ? `${dPeerID} (local node)` : dPeerID) + ']')
}

clubnet.on('newPeer', peerID => {
  decoratePeerID(peerID).then(peerID => log('Peer', peerID, 'discovered'))
})

clubnet.on('peer', function (peerID) {
  var p = new Peer({ key: peerID })
  decoratePeerID(peerID).then(decoratedPeerID => {
    ipfs.nameResolve(peerID)
      .then(resolvedKey => {
        if (publishedKeys.has(resolvedKey)) { return }

        log('Peer', decoratedPeerID, 'name resolved to new key', resolvedKey)
        ipfs.objectGet(resolvedKey + '/allthemusic/contents')
          .then(fetchPeersContents)
          .catch(() => log(`Peer ${decoratedPeerID} published key doesn't appear to be an ATM index`))
      })
      .catch(() => log(`Peer ${decoratedPeerID} failed to resolve`))
  })
})

getPeers()
updateTracks()

function injectLivereload() {
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.src = 'http://localhost:35729/livereload.js?snipver=1'
  document.getElementsByTagName('head')[0].appendChild(script)
}

if (process.env.GULP) {
  injectLivereload()
}

React.render(<App />, document.getElementById('content'))
