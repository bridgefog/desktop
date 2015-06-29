import { Map, Record } from 'immutable'
import alt from '../alt'
import actions from '../actions/tracks'

class TrackStore {
  constructor() {
    this.tracks = new Map()
    this.availableTracks = new Map()
    this.searchFilter = ''

    this.bindListeners({
      add: actions.add,
      addMulti: actions.addMulti,
      updateSearchFilter: actions.updateSearchFilter,
      mouseOver: actions.mouseOver,
      mouseOut: actions.mouseOut,
    })
  }

  add(track) {
    this.availableTracks = this.availableTracks.set(track.id, track)
    this._updateTracks()
  }

  addMulti(tracks) {
    tracks.forEach(track => {
      this.availableTracks = this.availableTracks.set(track.id, track)
    })
    console.log('tracks updated', tracks.length)
    this._updateTracks()
  }

  updateSearchFilter(searchFilter) {
    this.searchFilter = searchFilter
    this._updateTracks()
  }

  _updateTracks() {
    this.tracks = this._filteredTracks().take(50)
  }

  _filteredTracks() {
    if (this.searchFilter === '') { return this.availableTracks }

    return this.availableTracks.filter(track => {
      if (track.artist.toLowerCase().search(this.searchFilter) >= 0) { return true }
      if (track.title.toLowerCase().search(this.searchFilter) >= 0) { return true }
      return false
    })
  }

  mouseOver(trackID) {
    this.mousedOverTrackID = trackID
  }

  mouseOut(trackID) {
    this.mousedOverTrackID = null
  }
}

export default alt.createStore(TrackStore, 'TrackStore')
