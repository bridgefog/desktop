import { Map, Record } from 'immutable'
import alt from '../alt'
import actions from '../actions/tracks'

class TrackStore {
  constructor() {
    this.tracks = new Map()

    this.bindListeners({
      add: actions.add,
      mouseOver: actions.mouseOver,
      mouseOut: actions.mouseOut,
    })
  }

  add(track) {
    this.tracks = this.tracks.set(track.id, track)
  }

  mouseOver(trackID) {
    this.mousedOverTrackID = trackID
  }

  mouseOut(trackID) {
    this.mousedOverTrackID = null
  }
}

export default alt.createStore(TrackStore, 'TrackStore')
