import { Map, Record } from 'immutable'
import alt from '../alt'
import actions from '../actions/tracks'

export var Track = Record({
  id: null,
  title: null,
  artist: null,
})

class TrackStore {
  constructor() {
    this.tracks = new Map()

    this.bindListeners({
      add: actions.add,
      mouseOver: actions.mouseOver,
    })
  }

  add(track) {
    this.tracks = this.tracks.set(track.id, track)
  }

  mouseOver(trackID) {
    // console.log('track id: ', trackID)
    this.mousedOverTrackID = trackID
  }

  mouseOut(trackID) {
    console.log('track id: ', trackID)
    this.mousedOutTrackID = trackID
  }
}

export default alt.createStore(TrackStore, 'TrackStore')
