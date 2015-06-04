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
        {this.state.playing ? <div>Currently playing: {this.src()}</div> : ''}
      </div>
    )
  },
})

export default Player
