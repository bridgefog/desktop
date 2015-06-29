import React from 'react'
import Track from '../components/track'
import trackStore from '../stores/track-store'
import playerStore from '../stores/player-store'

class Tracklist extends React.Component {
  constructor(props) {
    super(props)
    this.state = trackStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    trackStore.listen(this.onChange)
    playerStore.listen(this.onChange)
  }

  componentWillUnmount() {
    trackStore.unlisten(this.onChange)
    playerStore.unlisten(this.onChange)
  }

  onChange(state) {
    this.setState(state)
  }

  allTracks() {
    var tracks = []
    var trackInfo = this.state.tracks.toObject()
    var count = 0
    for (var id in trackInfo) {
      if (trackInfo[id].artist != 'unknown' && trackInfo[id] != 'unknown'.title ) {
        var props = {}
        props.key = id
        props.id = id
        props.artist = trackInfo[id].artist
        props.title = trackInfo[id].title
        props.isMousedOver = (this.state.mousedOverTrackID == id)
        props.isPlaying = (this.state.isPlaying && (this.state.playingID == id))
        tracks.push(<Track {...props} />)
      }
    }
    return tracks
  }

  render() {
    return (
      <ul>{this.allTracks()}</ul>
      )
  }
}

export default Tracklist
