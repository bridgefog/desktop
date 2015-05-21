import { Map, Record } from 'immutable'
import alt from '../alt'
import actions from '../actions/tracks'

export var Track = Record({
  key: null,
  title: null,
  artist: null,
})

// class Track extends _Track {
//   get key() {

//   }
// }

class TrackStore {
  constructor() {
    this.tracks = new Map()

    this.bindListeners({
      add: actions.ADD,
    })
  }

  add(track) {
    this.tracks = this.tracks.set(track.key, track)
  }
}
export default alt.createStore(TrackStore, 'TrackStore')
