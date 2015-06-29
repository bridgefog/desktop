import path from 'path'
import fs from 'fs'
import { debuglog } from 'util'

import R from 'ramda'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'

import { spawnProcP, waitProcess } from './utils'

var log = debuglog('ipfs-daemon')

export default class IPFSDaemonController {
  constructor(options) {
    if (!options.ipfsDir) { throw new Error('ipfsDir is a required options') }
    this.ipfsDir = options.ipfsDir
    this.shouldRestart = options.shouldRestart
    this.endpoint = 'http://localhost:5001'
    this.promises = {}
  }

  ensureInitialized() {
    if (this.promises.initialize) { return this.promises.initialize }

    if (fs.existsSync(path.join(this.ipfsDir, 'config'))) {
      log('init - already initialized')
      return Promise.resolve()
    }

    log('init - starting')
    var opts = { env: this.processEnv() }
    this.promises.initialize = spawnProcP(this.executablePath(), ['init'], opts)
      .then(waitProcess)

    this.promises.initialize
      .then(() => log('init finished'))
      .catch(err => log('init failed', err))

    return this.promises.initialize
  }

  startChild() {
    if (this.promises.startChild) { return this.promises.startChild }

    log('starting ipfs daemon child process')

    var opts = { env: this.processEnv() }

    var startP = this.promises.startChild = this.ensureInitialized()
      .then(() => spawnProcP(this.executablePath(), ['daemon'], opts))
      .then(wrapper => {
        wrapper.process.on('close', code => {
          log('process exited with code ' + code)
          wrapper.exited = true
        })
        return wrapper
      })

    var waitP = this.promises.waitProcess = startP.then(waitProcess)

    // process ended with successful error code; restart if should
    waitP.then(() => this.shouldRestart && this.restart())

    return startP
  }

  waitProcess() {
    if (this.promises.waitProcess) { return this.promises.waitProcess }

    this.startChild()
    return this.promises.waitProcess
  }

  restart() {
    return this.kill()
      .then(() => {
        // drop references to old promises and processes so we can restart the
        // process
        this.promises = {}
        return this.startChild()
      })
  }

  kill() {
    return this.startChild()
      .then(wrapper => {
        if (!wrapper.exited) { wrapper.process.kill('SIGKILL') }
      })
      .then(() => this.waitProcess())
  }

  processEnv() {
    return R.merge(process.env, { IPFS_PATH: this.ipfsDir })
  }

  waitForReadiness(timeout=10000) {
    return this.startChild().then(() => {
      return new Promise((resolve, reject) => {
        var stopTrying = false

        var _timeout = setTimeout(() => {
          reject()
          stopTrying = true
        }, timeout)

        var ipfsClient = new IPFSClient(this.endpoint)
        console.log('Waiting for IPFS...')

        var attempt = () => {
          if (stopTrying) { return }
          ipfsClient.peerID()
            .then(() => {
              clearTimeout(_timeout)
              resolve()
            })
            .catch((err) => {
              console.log(err)
              setTimeout(attempt, 500)
            })
        }

        attempt()
      })
    })
  }

  executablePath() {
    if (process.env.GULP) {
      return 'ipfs' // let the system resolve from PATH
    } else {
      // use the ipfs binary bundled in the packaged app
      return path.join(__dirname, '../../vendor/ipfs')
    }
  }
}
