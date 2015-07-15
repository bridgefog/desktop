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
    return this.state.tracks.toJS().map(track => {
      var props = {
        key: track.id,
        isMousedOver: (this.state.mousedOverTrackID == track.id),
        isPlaying: (this.state.isPlaying && this.state.playingID == track.id),
      }
      props = R.merge(props, track)
      return (<Track {...props} />)
    })
  }

  render() {
    var style = {
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'center',
      alignItems: 'center',
    }
    style = R.merge(style, this.props.style)

    return (
      <div style={style}>{this.allTracks()}</div>
    )
  }
}

export default Tracklist
