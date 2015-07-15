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
      for (let publicKey of this.publicKeys) {
        try {
          if (keyTool.signatureIsValid(message, publicKey, signature)) {
            matchedKeys = matchedKeys.add(publicKey)
          }
        } catch (e) {
          if (
            !e.message.match(/routines:RSA_padding_check_PKCS1_type_1:block type is not 01/) &&
            !e.message.match(/routines:RSA_EAY_PUBLIC_DECRYPT:data too large for modulus/)
          ) {
            throw (e)
          }
        }
      }
    }
    return matchedKeys.size === 2
  }

}

export default UpdateVerifier
