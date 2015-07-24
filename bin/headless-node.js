#!/usr/bin/env babel-node

import { debuglog } from 'util'
import path from 'path'

import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'
import R from 'ramda'
import Queue from 'queue'
import devnull from 'dev-null'

import DiscoveryService from '../lib/discovery'

let log = debuglog('headless')

let releaseBasePath = path.resolve(__dirname, '../tmp/releases')

let ipfsClient = new IPFSClient(ipfsUtil.ipfsEndpoint())

let discovery = new DiscoveryService({
  ipfsClient,
  releaseBasePath,
})

let totalFetched = 0
let totalGivenUp = 0

function handleJobFailure(job, err) {
  let label = err ? 'ERROR' : 'TIMEOUT'
  if (job.retries > 0) {
    log(`${label} for fetch of ${job.label}: ${job.ipfsPath}; retries left = ${job.retries}`, err)
    job.retries -= 1
    queue.push(job)
  } else {
    log(`${label} for fetch of ${job.label}: ${job.ipfsPath}; giving up!`, err)
    totalGivenUp += 1
  }
}

let queue

var printQueueStats = debounce(() => {
  log('STATS:', { queue_length: queue.length, fetched: totalFetched, given_up: totalGivenUp })
}, 500)

queue = new Queue({ concurrency: 3, timeout: 60000 })
  .on('error', (err, job) => {
    handleJobFailure(job, err)
    printQueueStats()
  })
  .on('timeout', (next, job) => {
    handleJobFailure(job)
    printQueueStats()
    next()
  })
  .on('success', (result, job) => {
    log(`SUCCESS for fetch of ${job.label}: ${job.ipfsPath}`)
    printQueueStats()
    totalFetched += 1
  })
  .on('end', () => {
    log('EMPTY')
    printQueueStats()
  })

function createFetchJob(label, ipfsPath, retries = 5) {
  let fn = cb => {
    log(`START fetch for ${ipfsPath}`)
    ipfsClient.cat(ipfsPath)
      .then(stream => {
        stream.pipe(devnull())
          .on('error', err => cb(err))
      })
      .then(() => cb())
      .catch(cb)
  }
  fn.ipfsPath = ipfsPath
  fn.label = label
  fn.retries = retries
  return fn
}


function enqueueLatestBatch() {
  if (discovery.tracklist.latestBatch.isEmpty()) {
    setTimeout(enqueueLatestBatch, 200)
    return
  }
  discovery.tracklist.getAndFlushLatestBatch().forEach(track => {
    let label = `${track.artist} - ${track.title}`
    queue.push(createFetchJob(label, `/ipfs/${track.id}/file`))
    queue.push(createFetchJob(label, `/ipfs/${track.id}/image`))
    printQueueStats()
  })
  queue.start()
  process.nextTick(enqueueLatestBatch)
}

function debounce(func, delay) {
  let timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      func()
    }, delay)
  }
}

discovery.start()
enqueueLatestBatch()
