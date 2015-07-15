import downloadUpdate from './download-update'
import UpdateVerifier from './verifier'
import { coreDevPublicKeys } from '../key-tool'

class Updater {
  constructor() {
    this.currentRelease = { payload: { timestamp: 0 } }
  }

  tryRelease(release) {
    // release is payload/signatures JSON object
    new UpdateVerifier(this.currentRelease, release, coreDevPublicKeys)
  }
}

export default Updater
