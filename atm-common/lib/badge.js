'use strict'

import DagObject from './dag-object'

const oneHourInMilliseconds = 1000 * 60 * 60
const prefix = 'AllTheMusic:'

export default class Badge {
  constructor(nameSpace, now) {
    now = now || Date.now()
    var hoursSinceEpoch = Math.round(now / oneHourInMilliseconds)
    nameSpace = nameSpace || ''
    this._hash = null
    this.name =  prefix + nameSpace + hoursSinceEpoch
  }

  dagObject() {
    return new DagObject({ data: this.name })
  }

  hash() {
    // eventually this will actually calculate the hash, but for now, we're
    // shoving the hash from IPFS back into this object
    return this._hash
  }

  setHash(hash) {
    this._hash = hash
  }
}
