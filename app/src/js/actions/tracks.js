import alt from '../alt'

class TrackActions {
  add(track) {
    this.dispatch(track)
  }
}

export default alt.createActions(TrackActions)
