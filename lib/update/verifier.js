import ursa from 'ursa-purejs'
import { Set } from 'immutable'
import semver from 'semver'
import keyTool from '../key-tool'

class UpdateVerifier {
  constructor(currentVersion, newUpdate, publicKeys) {
    this.currentVersion = currentVersion
    this.newUpdate = newUpdate
    this.publicKeys = publicKeys
  }

  isSignedAndVerified() {
    return this._updateIsNew() && this._twoOfThreeAreValid()
  }

  _updateIsNew() {
    return semver.gt(this.newUpdate.payload.version, this.currentVersion)
  }

  _twoOfThreeAreValid() {
    var message = new Buffer(JSON.stringify(this.newUpdate.payload))
    var matchedKeys = new Set()
    for (let signature of this.newUpdate.signatures) {
      var matchedKey = keyTool.signatureIsValidMultiKey(
        message,
        this.publicKeys,
        signature.body
      )

      if (matchedKey) {
        matchedKeys = matchedKeys.add(matchedKey)
      }
      if (matchedKeys.size >= 2) {
        return true
      }
    }
    return false
  }

}

export default UpdateVerifier
