import fs from 'fs'
import ursa from 'ursa-purejs'
import { assert } from 'chai'
import keyTool from '../../lib/key-tool'
import childProcess from 'child_process'

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

describe('KeyTool', () => {
  describe('#signatureIsValid', () => {
    it('verifies a valid signature from a buffer', () => {
      var message = new Buffer('Sign me')
      var publicKey = keypair1.publicKey
      var keypair = ursa.createPrivateKey(keypair1.privateKey, undefined, 'base64')
      var signature = keypair.hashAndSign('SHA256', message)

      assert.equal(keyTool.signatureIsValid(message, publicKey, signature), true)
    })

    it('verifies a valid signature from a string message', () => {
      var message = 'Sign me'
      var publicKey = keypair1.publicKey
      var keypair = ursa.createPrivateKey(keypair1.privateKey, undefined, 'base64')
      var signature = keypair.hashAndSign('SHA256', message)

      assert.equal(keyTool.signatureIsValid(message, publicKey, signature), true)
    })
  })

  describe('#signatureIsValidMultiKey', () => {
    it('returns the publicKey that verifies the message/signature', () => {
      var message = 'Sign me'
      var keypair = ursa.createPrivateKey(keypair2.privateKey, undefined, 'base64')
      var signature = keypair.hashAndSign('SHA256', message)
      var publicKeys = [keypair1.publicKey, keypair2.publicKey, keypair3.publicKey]

      assert.equal(keyTool.signatureIsValidMultiKey(message, publicKeys, signature), keypair2.publicKey)
    })

    it('returns false if no key verifies the message/signature', () => {
      var message = 'Sign me'
      var keypair = ursa.createPrivateKey(keypair4.privateKey, undefined, 'base64')
      var signature = keypair.hashAndSign('SHA256', message)
      var publicKeys = [keypair1.publicKey, keypair2.publicKey, keypair3.publicKey]

      assert.equal(keyTool.signatureIsValidMultiKey(message, publicKeys, signature), false)
    })
  })

  describe('#signatureIsCoreDev', () => {
    it('returns true if signed by core dev', () => {
      var message = 'Sign me'
      var signature = 'LdD8vF/A0lVpEkzTt+uTP7evZ9y8wEeFAlSxctOys/SDWRqa8f1ErFFZ9AgN9lnqBjJrnTIUM+tpr1zIeOLE/MOeeW+JEvBXF+fZQ0V1PsV1MW3XmCTIiOqkF5N9Ph/9LPW6do2rhtbHB43pCxx6L39DbXh+nNcH+Mv5telx5h/WhPKgAhiqc+gdwnLB16R6yKjbcgoTehc9j3P5g5xYxXNxzN6wLoo/3k5vGaiY0BYr7sdrPJXDaY4jUs3ECNIdM9x2nZylum1aUMxXxW+knRr+W683tkES2QHrOkotVMe5UhufEWhr6MFy6sUecJg2SQzCpfoFDHVirXjuA84hAw=='

      assert.equal(keyTool.signatureIsCoreDev(message, signature), true)
    })

    it('returns false if not signed by core dev', () => {
      var message = 'Sign me'
      var keypair = ursa.createPrivateKey(keypair1.privateKey, undefined, 'base64')
      var signature = keypair.hashAndSign('SHA256', message)

      assert.equal(keyTool.signatureIsCoreDev(message, signature), false)
    })
  })
})
