import downloadUpdate from './download-update'
import UpdateVerifier from './verifier'
import { coreDevPublicKeys } from '../key-tool'

var currentAppVersion = require('../../package.json').version

class Updater {
  constructor({ ipfsClient, basePath, onVerifiedRelease }) {
    this.ipfsClient = ipfsClient
    this.basePath = basePath
    this.onVerifiedRelease = onVerifiedRelease || Function()
    this.currentVerifiedRelease = null
  }

  tryRelease(release) {
    var releaseVerifier = new UpdateVerifier(currentAppVersion, release, coreDevPublicKeys())

    if (releaseVerifier.isSignedAndVerified()) {
      console.log('Updater: found and verified new release. Downloading now...')
      var ipfsKey = release.payload.ipfsKey

      downloadUpdate(this.ipfsClient, ipfsKey, this.basePath)
        .then(newReleasePath => {
          this.currentVerifiedRelease = release
          this.onVerifiedRelease(newReleasePath)
          console.log('successfully downloaded new release')
        })
        .catch(err => {
          console.error('ERROR while downloading new verified release', { release, ipfsKey, basePath: this.basePath, err })
        })
    } else {
      console.log('Updater: ignoring release which didn\'t validate', release)
    }
  }
}

export default Updater
