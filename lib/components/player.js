import React from 'react'
import PlayPauseButton from '../components/play-pause-button'
import AudioElement from '../components/audio-element'
import PlaybackProgressBar from '../components/playback-progress-bar'
import PlaybackTime from '../components/playback-time'
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
    if (!this.state.trackLoaded) { return null }

    var styles = {
      container: {
        color: 'white',
        backgroundColor: '#333',
      },
      main: {
        padding: '1em',
        display: 'flex',
        flexDirection: 'row',
      },
      button: {
        flex: '0 0 auto',
        marginRight: '1em',
      },
      info: {
        flex: '1 1 auto',
        minWidth: '10em',
      },
      title: {
        fontSize: '1.6em',
        marginBottom: '0.4em',
      },
      artist: {
        fontSize: '1.3em',
      },
      PlaybackTime: {
        flex: '0 0 10em',
        align: 'right',
      },
    }

    return (
      <div style={styles.container}>
        <PlaybackProgressBar {...this.state.playingStats} style={styles.progress} />
        <div style={styles.main}>
          <PlayPauseButton isPlaying={this.state.isPlaying} style={styles.button} />
          <div style={styles.info}>
            <div style={styles.title}>{this.state.playingTitle}</div>
            <div style={styles.artist}>{this.state.playingArtist}</div>
          </div>
          <PlaybackTime {...this.state.playingStats} style={styles.playbackTime} />
        </div>

        <AudioElement {...this.state} key='audio-element' />
      </div>
    )
  }
}

export default Player
