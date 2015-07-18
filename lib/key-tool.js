import fs from 'fs'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'
import ursa from 'ursa-purejs'
import path from 'path'

var ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())
var coreDevPublicKeys = [
  fs.readFileSync(path.resolve(__dirname, '../resources/core-dev/key1.pub')),
  fs.readFileSync(path.resolve(__dirname, '../resources/core-dev/key2.pub')),
  fs.readFileSync(path.resolve(__dirname, '../resources/core-dev/key3.pub')),
]

class KeyTool {
  constructor() {
    this.coreDevPublicIPFSKeys = [
      'QmQhUUcrMnJD2q8MRZUhRT4akyqsWP7Sf1wGKxHTMpFYnW',
      'QmZF8bhrNLcZgrnaonW74QZUSa82XbzczR8MA9EibivTuM',
      'QmT6rhuDJ2QLN67TibHkon9deupqMkVdSqJpBP74vEfsjz',
    ]
  }

  signatureIsValid(message, publicKey, signature) {
    message = new Buffer(message)
    var keypair = ursa.createPublicKey(publicKey, 'base64')
    return keypair.hashAndVerify('SHA256', message, signature, 'base64')
  }

  signatureIsValidMultiKey(message, publicKeys, signature) {
    message = new Buffer(message)
    for (let publicKey of publicKeys) {
      try {
        if (this.signatureIsValid(message, publicKey, signature)) {
          return publicKey
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
    return false
  }

  signatureIsCoreDev(message, signature) {
    return Boolean(this.signatureIsValidMultiKey(message, coreDevPublicKeys, signature))
  }

  coreDevPublicKey(IPFSKey) {
    ipfs.get(IPFSKey).then(publicKey => {
      console.log(publicKey)
    })
  }
}

export default new KeyTool
export { coreDevPublicKeys }
