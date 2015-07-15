import fs from 'fs'
import ursa from 'ursa-purejs'
import { assert } from 'chai'
import keyTool from '../../lib/key-tool'

var keypair1 = {
  privateKey: fs.readFileSync('test/fixtures/key1.pem'),
  publicKey: fs.readFileSync('test/fixtures/key1.pub.pem'),
}
var keypair2 = {
  privateKey: fs.readFileSync('test/fixtures/key2.pem'),
  publicKey: fs.readFileSync('test/fixtures/key2.pub.pem'),
}


describe('KeyTool', () => {
  describe('#signatureIsValid', () => {
    it('verifies a valid signature from a buffer', () => {
      var message = new Buffer("Sign me")
      var publicKey = keypair1.publicKey
      var keypair = ursa.createPrivateKey(keypair1.privateKey, undefined, 'base64')
      var signature = keypair.hashAndSign('SHA256', message)

      assert.equal(keyTool.signatureIsValid(message, publicKey, signature), true)
    })

    it('verifies a valid signature from a string message', () => {
      var message = "Sign me"
      var publicKey = keypair1.publicKey
      var keypair = ursa.createPrivateKey(keypair1.privateKey, undefined, 'base64')
      var signature = keypair.hashAndSign('SHA256', message)

      assert.equal(keyTool.signatureIsValid(message, publicKey, signature), true)
    })
  })
})
