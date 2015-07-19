import { debuglog } from 'util'

import downloadUpdate from './download-update'
import UpdateVerifier from './verifier'
import { coreDevPublicKeys } from '../key-tool'

var currentAppVersion = require('../../package.json').version

var log = debuglog('updater')
log('Updater.js: currentAppVersion =', currentAppVersion)

class Updater {
  constructor({ ipfsClient, basePath, onVerifiedRelease }) {
    this.ipfsClient = ipfsClient
    this.basePath = basePath
    this.onVerifiedRelease = onVerifiedRelease || Function()
    this.currentVerifiedRelease = null
  }

  tryRelease(release) {
    var releaseVerifier = new UpdateVerifier(currentAppVersion, release, coreDevPublicKeys)

    if (releaseVerifier.isSignedAndVerified()) {
      log('Updater: found and verified new release. Downloading now...')
      var ipfsKey = release.payload.ipfsKey

      downloadUpdate(this.ipfsClient, ipfsKey, this.basePath)
        .then(newReleasePath => {
          this.currentVerifiedRelease = release
          this.onVerifiedRelease(newReleasePath)
          log('successfully downloaded new release')
        })
        .catch(err => {
          log('ERROR while downloading new verified release', { release, ipfsKey, basePath: this.basePath, err })
        })
    } else {
      log('Updater: ignoring release which didn\'t validate', release)
    }
  }
}

export default Updater
