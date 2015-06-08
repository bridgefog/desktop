import React from 'react'
import Track from '../components/track'
import trackStore from '../stores/track-store'

var Tracklist = React.createClass({
  getInitialState() {
    return trackStore.getState()
  },

  componentDidMount() {
    trackStore.listen(this.onChange)
  },

  componentWillUnmount() {
    trackStore.unlisten(this.onChange)
  },

  onChange(state) {
    this.setState(state)
  },

  allTracks() {
    var tracks = []
    var trackInfo = this.state.tracks.toObject()
    for (var id in trackInfo) {
      var props = {}
      props.key = id
      props.id = id
      props.artist = trackInfo[id].artist
      props.title = trackInfo[id].title
      props.isMousedOver = (this.state.mousedOverTrackID == id)
      tracks.push(<Track {...props} />)
    }
    return tracks
  },

  render() {
    return (
      <ul>{this.allTracks()}</ul>
      )
  },
})

export default Tracklist
