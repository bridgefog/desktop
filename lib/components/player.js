import React from 'react'
import playerStore from '../stores/player-store'
import playerActions from '../actions/player'

var PlayPauseButton = React.createClass({
  toggle() {
    playerActions.togglePlayPause()
  },

  render() {
    return (
      <button onClick={this.toggle}>{this.props.text}</button>
    )
  },
})

var Player = React.createClass({
  propTypes: {
    src: React.PropTypes.string,
    preload: React.PropTypes.string,
    mimeType: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      preload: 'metadata',
      mimeType: 'audio/mpeg',
    }
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

  onChange(state) {
    this.setState(state)
    this.audio().src = this.src()
    this.state.playing ? this.audio().play() : this.audio().pause()
  },

  playPauseText() {
    return this.state.playing ? 'Pause' : 'Play'
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
        <PlayPauseButton text={this.playPauseText()} />
        <audio ref="audio" preload={this.props.preload} />
        <div>Currently playing: {this.src()}</div>
      </div>
    )
  },
})

export default Player
