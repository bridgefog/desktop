import React from 'react'
import playerStore from '../stores/player'
import playerActions from '../actions/player'

var PlayPauseButton = React.createClass({
  toggle() {
    console.log('toggle')
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
    src: React.PropTypes.string.isRequired,
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
    this.state.playing ? this.audio().pause() : this.audio().play()
  },

  playPauseText() {
    return this.state.playing ? 'Pause' : 'Play'
  },

  audio() {
    return this.refs.audio.getDOMNode()
  },

  render() {
    return (
      <div>
        <h2>Player</h2>
        <PlayPauseButton text={this.playPauseText()} />
        <audio ref="audio" preload={this.props.preload}>
          <source src={this.state.src} type={this.props.mimeType} />
        </audio>
        <div>Currently playing: {this.state.src}</div>
      </div>
    )
  },
})

export default Player
