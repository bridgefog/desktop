import R from 'ramda'
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
      var props = {
        key: id,
        id: id,
        isMousedOver: (this.state.mousedOverTrackID == id),
        isPlaying: (this.state.isPlaying && this.state.playingID == id),
      }
      props = R.merge(props, trackInfo[id])
      tracks.push(<Track {...props} />)
    }
    return tracks
  }

  render() {
    var style = {
      padding: '1em',
    }

    return (
      <div style={style}>{this.allTracks()}</div>
    )
  }
}

export default Tracklist
