import fs from 'fs'
import ursa from 'ursa-purejs'
import { assert } from 'chai'
import UpdateVerifier from '../../../lib/update/verifier'

var keypair1 = {
  privateKey: fs.readFileSync('test/fixtures/key1.pem'),
  publicKey: fs.readFileSync('test/fixtures/key1.pub.pem'),
}
var keypair2 = {
  privateKey: fs.readFileSync('test/fixtures/key2.pem'),
  publicKey: fs.readFileSync('test/fixtures/key2.pub.pem'),
}
var keypair3 = {
  privateKey: fs.readFileSync('test/fixtures/key3.pem'),
  publicKey: fs.readFileSync('test/fixtures/key3.pub.pem'),
}
var keypair4 = {
  privateKey: fs.readFileSync('test/fixtures/key4.pem'),
  publicKey: fs.readFileSync('test/fixtures/key4.pub.pem'),
}

var publicKeys = [keypair1.publicKey, keypair2.publicKey, keypair3.publicKey]
var currentVersion
var newUpdate
var updateVerifier

describe('UpdateVerifier', () => {
  beforeEach(() => {
    currentVersion = '1.0.0'
    newUpdate = createUpdate('1.0.1')
    updateVerifier = new UpdateVerifier(currentVersion, newUpdate, publicKeys)
  })

  describe('#isSignedAndVerified', () => {
    describe('Verifies when it', () => {
      it('is a valid release object', () => {
        assert(updateVerifier.isSignedAndVerified())
      })
    })

    describe('Does not verify when it', () => {
      it('is an old release', () => {
        newUpdate = createUpdate('0.9.23')
        updateVerifier = new UpdateVerifier(currentVersion, newUpdate, publicKeys)

        assert.equal(updateVerifier.isSignedAndVerified(), false)
      })

      it('has two signatures are verified by the same publicKey', () => {
        newUpdate.signatures[1] = newUpdate.signatures[0]
        updateVerifier = new UpdateVerifier(currentVersion, newUpdate, publicKeys)

        assert.equal(updateVerifier.isSignedAndVerified(), false)
      })

      it('is verified by some other publicKey', () => {
        var message = JSON.stringify(newUpdate.payload)
        newUpdate.signatures[1].body = signMessage(message, keypair4.privateKey)
        updateVerifier = new UpdateVerifier(currentVersion, newUpdate, publicKeys)

        assert.equal(updateVerifier.isSignedAndVerified(), false)
      })

      it('signed by two valid signatures but changed message', () => {
        newUpdate.payload.ipfsKey = 'QmSomeNewIPFSKeyThatAintRight'
        var updateVerifier = new UpdateVerifier(currentVersion, newUpdate, publicKeys)

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
  var keypair = ursa.createPrivateKey(privateKey, undefined, 'base64')

  return keypair.hashAndSign('SHA256', message)
}

function createUpdate(version, signature1, signature2) {
  var payload = {
    version: version,
    ipfsKey: 'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtuEfL',
  }

  signature1 = signature1 ?
    signature1 : signMessage(JSON.stringify(payload), keypair1.privateKey)

  signature2 = signature2 ?
    signature2 : signMessage(JSON.stringify(payload), keypair2.privateKey)

  return {
    payload: payload,

    signatures: [
      { body: signature1 },
      { body: signature2 },
    ],
  }
}
