import ursa from 'ursa-purejs'
import { Set } from 'immutable'
import keyTool from '../key-tool'

class UpdateVerifier {
  constructor(currentUpdate, newUpdate, publicKeys) {
    this.currentUpdate = currentUpdate
    this.newUpdate = newUpdate
    this.publicKeys = publicKeys
  }

  isSignedAndVerified() {
    return this._updateIsNew() && this._twoOfThreeAreValid()
  }

  _updateIsNew() {
    return this.newUpdate.payload.timestamp > this.currentUpdate.payload.timestamp
  }

  _twoOfThreeAreValid() {
    var message = new Buffer(JSON.stringify(this.newUpdate.payload))
    var matchedKeys = new Set()
    for (let signature of this.newUpdate.signatures) {
      var matchedKey = keyTool.signatureIsValidMultiKey(message, this.publicKeys, signature)
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
