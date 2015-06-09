import React from 'react'
import PlayPauseButton from '../components/play-pause-button'
import AudioElement from '../components/audio-element'
import playerStore from '../stores/player-store'

class Player extends React.Component {
  constructor(props) {
    super(props)
    this.state = playerStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    playerStore.listen(this.onChange)
  }

  componentWillUnmount() {
    playerStore.unlisten(this.onChange)
  }

  onChange(state) {
    this.setState(state)
  }

  render() {
    if (!this.state.trackLoaded) { return <AudioElement {...this.state} key='audio-element' /> }

    var style = {
      position: 'fixed',
      bottom: 0,
      padding: '1em',
      color: 'white',
      backgroundColor: '#333',
      width: '100%',
    }

    return (
      <div style={style}>
        <div style={{ float: 'left' }} >
          <PlayPauseButton isPlaying={this.state.isPlaying} />
          <AudioElement {...this.state} key='audio-element' />
        </div>

        <div style={{ float: 'left', padding: '0 1em 0 1.5em' }}>
          <div style={nowPlayingStyle}>
            <div style={{ fontSize: '2em' }}>{this.state.playingArtist}</div>
            <div>{this.state.playingTitle}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Player
