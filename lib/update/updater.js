import downloadUpdate from './download-update'
import UpdateVerifier from './verifier'
import { coreDevPublicKeys } from '../key-tool'

var currentAppVersion = require('../../package.json').version

class Updater {
  constructor({ ipfsClient, basepath, onVerifiedRelease }) {
    this.ipfsClient = ipfsClient
    this.basepath = basepath
    this.onVerifiedRelease = onVerifiedRelease || Function()
    this.currentVerifiedRelease = null
  }

  tryRelease(release) {
    console.log('Updater: attempting to verify new release', release)
    var releaseVerifier = new UpdateVerifier(currentAppVersion, release, coreDevPublicKeys)

    if (releaseVerifier.isSignedAndVerified()) {
      console.log('Updater: found and verified new release. Downloading now...')
      var ipfsKey = release.payload.ipfsKey

      downloadUpdate(this.ipfsClient, ipfsKey, this.basePath)
        .then(() => {
          this.currentVerifiedRelease = release
          this.onVerifiedRelease(ipfsKey)
        })
        .catch(err => {
          console.error('ERROR while downloading new verified release', { release, ipfsKey, basePath: this.basePath, err })
        })
    }
  }
}

export default Updater
