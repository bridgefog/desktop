import { Map, Record, Seq } from 'immutable'
import alt from '../alt'
import R from 'ramda'
import actions from '../actions/tracks'

var addToTracklist = R.reduce((list, track) => list.set(track.id, track))

class TrackStore {
  constructor() {
    this.tracks = new Seq()
    this.availableTracks = new Map()
    this.searchFilter = ''
    this._trackMatchesSearch = this._trackMatchesSearch.bind(this)

    this.bindListeners({
      add: actions.add,
      addMulti: actions.addMulti,
      updateSearchFilter: actions.updateSearchFilter,
      mouseOver: actions.mouseOver,
      mouseOut: actions.mouseOut,
    })
  }

  add(track) {
    this.addMulti([track])
  }

  addMulti(tracks) {
    this.availableTracks = this.availableTracks.withMutations(mutableList => {
      addToTracklist(mutableList, tracks)
    })
    this._updateTracks()
  }

  updateSearchFilter(searchFilter) {
    this.searchFilter = searchFilter
    this._updateTracks()
  }

  _updateTracks() {
    this.tracks = this._filteredTracks()
  }

  _filteredTracks() {
    var filtered = this.availableTracks.valueSeq()

    if (this.searchFilter !== '') {
      filtered = filtered.filter(this._trackMatchesSearch)
    }

    return filtered.take(50)
    // .cacheResult() // FIXME: is this useful? why doesn't it work?
  }

  mouseOver(trackID) {
    this.mousedOverTrackID = trackID
  }

  mouseOut(trackID) {
    this.mousedOverTrackID = null
  }

  _trackMatchesSearch(track) {
    if (track.artist.toLowerCase().search(this.searchFilter) >= 0) { return true }
    if (track.title.toLowerCase().search(this.searchFilter) >= 0) { return true }
    return false
  }
}

export default alt.createStore(TrackStore, 'TrackStore')
