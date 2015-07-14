import { Set } from 'immutable'

export default class TrackList {
  constructor() {
    this.knownIDs = new Set()
    this.inProgressIDs = new Set()
    this.latestBatch = new Set()
  }

  addTrack(id, track) {
    this.knownIDs = this.knownIDs.add(id)
    this._trackNotInProgress(id)

    if (!this._trackIsValid(track)) { return }

    this.latestBatch = this.latestBatch.add(track)
  }

  fetchTrack(trackID, ipfsClient) {
    if (this.knownIDs.has(trackID) || this.inProgressIDs.has(trackID)) {
      return Promise.resolve()
    }

    this._trackInProgress(trackID)

    return ipfsClient.objectGet(trackID)
      .then(dagObj => JSON.parse(dagObj.data))
      .then(track => this.addTrack(trackID, track))
      .catch(err => {
        this._trackNotInProgress(trackID)
        throw err
      })
  }

  fetchMulti(collection, ipfsClient) {
    return Promise.all(collection.map(key => {
      return this.fetchTrack(key, ipfsClient)
    }))
  }

  getAndFlushLatestBatch() {
    var ret = this.latestBatch
    this.latestBatch = new Set()
    return ret
  }

  _trackInProgress(trackID) {
    this.inProgressIDs = this.inProgressIDs.add(trackID)
  }

  _trackNotInProgress(trackID) {
    this.inProgressIDs = this.inProgressIDs.delete(trackID)
  }

  _trackIsValid(track) {
    return (track.artist != 'unknown') &&
      (track.title != 'unknown')
  }
}
