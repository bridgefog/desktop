import React from 'react'
import PlayPauseButton from '../components/play-pause-button'
import playerStore from '../stores/player-store'
import playerActions from '../actions/player'

var Player = React.createClass({
  getInitialState() {
    return playerStore.getState()
  },

  componentDidMount() {
    playerStore.listen(this.onChange)
    global.audioPlayer = this.audio()
    var audio = this.audio()
    audio.addEventListener('ended', () => console.log('Track ended'))
    audio.addEventListener('canplay', () => console.log('Track canplay'))
    audio.addEventListener('canplaythrough', () => console.log('Track canplaythrough'))
    audio.addEventListener('error', (err) => console.log('Track error', err))
    audio.addEventListener('loadedmetadata', () => console.log('Track loadedmetadata'))
    audio.addEventListener('loadeddata', () => console.log('Track loadeddata'))
    audio.addEventListener('loadstart', () => console.log('Track loadstart'))
    audio.addEventListener('playing', () => console.log('Track playing'))
    audio.addEventListener('pause', () => console.log('Track paused'))
    audio.addEventListener('progress', () => {
      var progress = audio.buffered.end(0) / audio.duration
      console.log('Track buffering progress:', progress * 100)
    })
    audio.addEventListener('stalled', () => console.log('Track stalled'))
    audio.addEventListener('waiting', () => console.log('Track waiting'))
    audio.addEventListener('suspend', () => console.log('Track buffering suspended'))
  },

  componentWillUnmount() {
    playerStore.unlisten(this.onChange)
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isPlaying) {
      if (prevState.playingID != this.state.playingID) {
        this.audio().src = this.src()
      }
      this.audio().play()
    } else {
      this.audio().pause()
    }
  },

  onChange(state) {
    this.setState(state)
  },

  audio() {
    return this.refs.audio.getDOMNode()
  },

  src() {
    return `http://localhost:8080/ipfs/${this.state.playingID}/file`
  },

  nowPlaying() {
    var nowPlayingStyle = this.state.isPlaying ? {} : { color: '#888' }

    if (this.state.trackLoaded) {
      return (
        <div style={nowPlayingStyle}>
          <div style={{ fontSize: '2em' }}>{this.state.playingArtist}</div>
          <div>{this.state.playingTitle}</div>
        </div>
      )
    } else {
      return <div style={{ padding: '2em 0', color: '#aaa' }}>Please select a track</div>
    }
  },

  render() {
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
          <audio ref="audio" />
        </div>

        <div style={{ float: 'left', padding: '0 1em 0 1.5em' }}>
          {this.nowPlaying()}
        </div>
      </div>
    )
  },
})

export default Player
