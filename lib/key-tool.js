import ursa from 'ursa-purejs'

class KeyTool {
  constructor() {
    this.coreDevPublicKey1 = 'QmQhUUcrMnJD2q8MRZUhRT4akyqsWP7Sf1wGKxHTMpFYnW'
    this.coreDevPublicKey2 = 'QmZF8bhrNLcZgrnaonW74QZUSa82XbzczR8MA9EibivTuM'
    this.coreDevPublicKey3 = 'QmT6rhuDJ2QLN67TibHkon9deupqMkVdSqJpBP74vEfsjz'
  }

  signatureIsValid(message, publicKey, signature) {
    message = new Buffer(message)
    var keypair = ursa.createPublicKey(publicKey, 'base64')
    return keypair.hashAndVerify('SHA256', message, signature, 'base64')
  }
}

export default new KeyTool
