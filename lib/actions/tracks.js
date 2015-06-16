import alt from '../alt'

class TrackActions {
  add(track) {
    this.dispatch(track)
  }

  updateSearchFilter(searchFilter) {
    this.dispatch(searchFilter)
  }

  mouseOver(trackID) {
    this.dispatch(trackID)
  }

  mouseOut(trackID) {
    this.dispatch(trackID)
  }
}

export default alt.createActions(TrackActions)
