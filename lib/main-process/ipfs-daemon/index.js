import path from 'path'
import fs from 'fs'
import { debuglog } from 'util'

import R from 'ramda'
import { IPFSClient } from 'atm-ipfs-api'

import { spawnProcP, waitProcess } from './utils'

var log = debuglog('ipfs-daemon')

export default class IPFSDaemonController {
  constructor(options) {
    if (!options.ipfsDir) { throw new Error('ipfsDir is a required option') }
    this.ipfsDir = options.ipfsDir
    this.shouldRestart = options.shouldRestart
    this.shuttingDown = false
    this.endpoint = 'http://localhost:4003'
    this.promises = {}
  }

  configPath() {
    return path.join(this.ipfsDir, 'config')
  }

  ensureInitialized() {
    if (this.promises.initialize) { return this.promises.initialize }

    if (fs.existsSync(this.configPath())) {
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

  configure() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.configPath(), (err, contents) => {
        if (err) { return reject(err) }

        var configuration = JSON.parse(contents)
        configuration.Addresses.Swarm = ['/ip4/0.0.0.0/tcp/4002']
        configuration.Addresses.API = '/ip4/127.0.0.1/tcp/4003'
        configuration.Addresses.Gateway = '/ip4/127.0.0.1/tcp/4004'

        fs.writeFile(this.configPath(), JSON.stringify(configuration), err => {
          if (err) { return reject(err) }
          resolve()
        })
      })
    })
  }

  startChild() {
    if (this.promises.startChild) { return this.promises.startChild }

    log('starting ipfs daemon child process')

    var opts = { env: this.processEnv() }

    var startP = this.promises.startChild = this.ensureInitialized()
      .then(() => this.configure())
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
    if (this.shuttingDown) { return Promise.resolve() }

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

  shutdown() {
    this.shuttingDown = true
    this.kill().then(() => { this.shuttingDown = false })
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
        log('Waiting for IPFS...')

        var attempt = () => {
          if (stopTrying) { return }
          ipfsClient.peerID()
            .then(() => {
              clearTimeout(_timeout)
              resolve()
            })
            .catch((err) => {
              log(err)
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
      return path.join(__dirname, '../../../vendor/ipfs/ipfs')
    }
  }
}
