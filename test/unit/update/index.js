import fs from 'fs'
import ursa from 'ursa'
import { assert } from 'chai'
import UpdateVerifier from '../../../lib/update'

var keypair1 = createKeyPair()
var keypair2 = createKeyPair()
var keypair3 = createKeyPair()
var keypair4 = createKeyPair()
var publicKeys = [keypair1.publicKey, keypair2.publicKey, keypair3.publicKey]
var timestamp = new Date().getTime()
var currentUpdate
var newUpdate
var updateVerifier

describe('updateVerifier', () => {
  beforeEach(() => {
    currentUpdate = createUpdate(timestamp)
    newUpdate = createUpdate(timestamp + 1000)
    updateVerifier = new UpdateVerifier(currentUpdate, newUpdate, publicKeys)
  })

  describe('#isSignedAndVerified', () => {
    describe('Verifies when it', () => {
      it('is a valid release object', () => {
        assert(updateVerifier.isSignedAndVerified())
      })
    })

    describe('Does not verify when it', () => {
      it('is an old release', () => {
        newUpdate = createUpdate(timestamp - 1000)
        updateVerifier = new UpdateVerifier(currentUpdate, newUpdate, publicKeys)

        assert.equal(updateVerifier.isSignedAndVerified(), false)
      })

      it('has two signatures are verified by the same publicKey', () => {
        newUpdate.signatures[1] = newUpdate.signatures[0]
        updateVerifier = new UpdateVerifier(currentUpdate, newUpdate, publicKeys)

        assert.equal(updateVerifier.isSignedAndVerified(), false)
      })

      it('is verified by some other publicKey', () => {
        var message = JSON.stringify(newUpdate.payload)
        newUpdate.signatures[1] = signMessage(message, keypair4.privateKey)
        updateVerifier = new UpdateVerifier(currentUpdate, newUpdate, publicKeys)

        assert.equal(updateVerifier.isSignedAndVerified(), false)
      })

      it('signed by two valid signatures but changed message', () => {
        newUpdate.payload.ipfsKey = 'QmSomeNewIPFSKeyThatAintRight'
        var updateVerifier = new UpdateVerifier(currentUpdate, newUpdate, publicKeys)

        assert.equal(updateVerifier.isSignedAndVerified(), false)
      })
    })
  })
})

function createKeyPair() {
  var keypair = ursa.generatePrivateKey()

  return {
    publicKey: keypair.toPublicPem('base64'),
    privateKey: keypair.toPrivatePem('base64'),
  }
}

function signMessage(message, privateKey) {
  var keypair = ursa.createPrivateKey(privateKey, '', 'base64')

  return keypair.hashAndSign('SHA256', message)
}

function createUpdate(timestamp, signature1, signature2) {
  var payload = {
    timestamp: timestamp,
    ipfsKey: 'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtuEfL',
  }

  signature1 = signature1 ?
    signature1 : signMessage(JSON.stringify(payload), keypair1.privateKey)

  signature2 = signature2 ?
    signature2 : signMessage(JSON.stringify(payload), keypair2.privateKey)

  return {
    payload: payload,

    signatures: [
      signature1,
      signature2,
    ],
  }
}
