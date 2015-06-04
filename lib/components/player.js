import React from 'react'
import playerStore from '../stores/player-store'
import playerActions from '../actions/player'

var PlayPauseButton = React.createClass({
  propTypes: {
    isPlaying: React.PropTypes.bool.isRequired
  },

  toggle() {
    playerActions.togglePlayPause()
  },

  label() {
    return this.props.isPlaying ? 'Pause' : 'Play'
  },

  render() {
    return (
      <button onClick={this.toggle}>{this.label()}</button>
    )
  },
})

var Player = React.createClass({
  propTypes: {},

  getDefaultProps() {
    return {}
  },

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
    if (this.state.playing) {
      if (prevState.id != this.state.id) {
        // don't set src unless it would have changed
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
    return `http://localhost:8080/ipfs/${this.state.id}/file`
  },

  render() {
    return (
      <div>
        <h2>Player</h2>
        <PlayPauseButton isPlaying={this.state.playing} />
        <audio ref="audio" />
        {this.state.playing ? <div>Currently playing: {this.state.artist} - {this.state.title}</div> : ''}
      </div>
    )
  },
})

export default Player
