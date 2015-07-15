import downloadUpdate from './download-update'
import UpdateVerifier from './verifier'
import { coreDevPublicKeys } from '../key-tool'

class Updater {
  constructor({ ipfsClient, basepath, onVerifiedRelease }) {
    this.ipfsClient = ipfsClient
    this.basepath = basepath
    this.onVerifiedRelease = onVerifiedRelease || Function()
  }

  tryRelease(release) {
    // release is payload/signatures JSON object
    var verified = new UpdateVerifier(this.currentRelease, release, coreDevPublicKeys).isSignedAndVerified()
    console.log('tryRelease()', release, { verified })

    verified = true

    if (verified) {
      var ipfsKey = release.payload.ipfsKey

      downloadUpdate(this.ipfsClient, ipfsKey, this.basePath)
        .then(() => this.onVerifiedRelease(ipfsKey))
    }
  }
}

export default Updater
