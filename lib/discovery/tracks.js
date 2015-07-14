export default class TrackList {
  constructor() {
    this.tracks = new Map()
    this.latestBatch = new Set()
  }

  add(track) {
    if (!this._trackIsValid(track)) { return }
    this.trackIDs = this.trackIDs.add(track.id)
    this.latestBatch = this.latestBatch.set(track.id, track)
  }

  _trackIsValid(track) {
    return (track.artist != 'unknown') &&
      (track.title != 'unknown')
  }
}
