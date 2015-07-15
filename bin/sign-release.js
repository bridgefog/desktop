#!/usr/bin/env babel-node

import fs from 'fs'
import childProcess from 'child_process'
import keyTool from '../lib/key-tool'
import ursa from 'ursa-purejs'

var privateKeyPath = `${process.env.HOME}/.ssh/bridgefog.pem`
var publicKeyPath = `${process.env.HOME}/.ssh/bridgefog.pem.pub`
var tmpPayloadPath = '/tmp/bridgefog-release-payload'
var releasePath = 'release.json'

var release = JSON.parse(fs.readFileSync(releasePath))
var payloadString = JSON.stringify(release.payload)

fs.writeFileSync(tmpPayloadPath, payloadString)

console.log(fs.readFileSync(tmpPayloadPath).toString())

var result = childProcess.spawnSync(
  'openssl',
  ['dgst', '-sha256', '-sign', privateKeyPath, tmpPayloadPath]
)

var signature = result.stdout.toString('base64')
// var publicKey = ursa.createPublicKey(keypair1privateKey, undefined, 'base64')
var publicKey = fs.readFileSync(publicKeyPath)

var valid = keyTool.signatureIsValid(payloadString, publicKey, signature)

if (valid) {
  console.log('Created signature, writing to release.json')
  release.signatures.push({ body: signature })
  fs.writeFileSync(releasePath, JSON.stringify(release))
} else {
  console.log('Created signature, but unable to verify, not writing to release.json')
}
