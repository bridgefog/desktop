import React from 'react'
import playerStore from '../stores/player-store'
import playerActions from '../actions/player'

var Play = React.createClass({
  render() {
    return (
      <svg x="0px" y="0px" width="70" height="70" viewBox="0 0 100 100" fill="white">
        <circle cx="35" cy="20" r="3"/><circle cx="35" cy="30" r="3"/><circle cx="35" cy="40" r="3"/>
        <circle cx="55" cy="40" r="3"/><circle cx="35" cy="50" r="3"/><circle cx="55" cy="50" r="3"/>
        <circle cx="65" cy="50" r="3"/><circle cx="35" cy="60" r="3"/><circle cx="55" cy="60" r="3"/>
        <circle cx="35" cy="70" r="3"/><circle cx="35" cy="80" r="3"/><circle cx="45" cy="40" r="3"/>
        <circle cx="45" cy="50" r="3"/><circle cx="45" cy="60" r="3"/><circle cx="45" cy="30" r="3"/>
        <circle cx="45" cy="70" r="3"/>
      </svg>
    )
  }
})

var Pause = React.createClass({
  render() {
    return (
      <svg x="0px" y="0px" width="70" height="70" viewBox="0 0 100 100" fill="white">
        <circle cx="30" cy="20" r="3"/><circle cx="40" cy="20" r="3"/><circle cx="60" cy="20" r="3"/>
        <circle cx="70" cy="20" r="3"/><circle cx="30" cy="30" r="3"/><circle cx="40" cy="30" r="3"/>
        <circle cx="60" cy="30" r="3"/><circle cx="70" cy="30" r="3"/><circle cx="30" cy="40" r="3"/>
        <circle cx="40" cy="40" r="3"/><circle cx="60" cy="40" r="3"/><circle cx="70" cy="40" r="3"/>
        <circle cx="30" cy="50" r="3"/><circle cx="40" cy="50" r="3"/><circle cx="60" cy="50" r="3"/>
        <circle cx="70" cy="50" r="3"/><circle cx="30" cy="60" r="3"/><circle cx="40" cy="60" r="3"/>
        <circle cx="60" cy="60" r="3"/><circle cx="70" cy="60" r="3"/><circle cx="30" cy="70" r="3"/>
        <circle cx="40" cy="70" r="3"/><circle cx="60" cy="70" r="3"/><circle cx="70" cy="70" r="3"/>
        <circle cx="30" cy="80" r="3"/><circle cx="40" cy="80" r="3"/><circle cx="60" cy="80" r="3"/>
        <circle cx="70" cy="80" r="3"/>
      </svg>
    )
  }
})

var PlayPauseButton = React.createClass({
  propTypes: {
    isPlaying: React.PropTypes.bool.isRequired
  },

  toggle() {
    playerActions.togglePlayPause()
  },

  buttonType() {
    return this.props.isPlaying ? <Pause /> : <Play />
  },

  render() {
    var style = {
      padding: '0.5em',
      marginBottom: 0,
    }

    return (
      <button style={style} onClick={this.toggle}>
        {this.buttonType()}
      </button>
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

  nowPlaying() {
    var nowPlayingStyle = this.state.playing ? {} : { color: '#888' }

    if (this.state.trackLoaded) {
      return (
        <div style={nowPlayingStyle}>
          <div style={{ fontSize: '2em' }}>{this.state.artist}</div>
          <div>{this.state.title}</div>
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
          <PlayPauseButton isPlaying={this.state.playing} />
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
