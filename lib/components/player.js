import React from 'react'
import playerStore from '../stores/player'
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
    this.audio().src = this.src()
    this.state.playing ? this.audio().play() : this.audio().play()
  },

  playPauseText() {
    return this.state.playing ? 'Pause' : 'Play'
  },

  audio() {
    return this.refs.audio.getDOMNode()
  },

  src() {
    console.log(`http://localhost:8080/ipfs/${this.state.key}/file`)
    return `http://localhost:8080/ipfs/${this.state.key}/file`
    // return `http://localhost:8080/ipfs/QmcdHnhxGffcXvyzDQVXy9rqnhNEZAMLWPfwt7VjBYMiCL/file`
  },

  render() {
    return (
      <div>
        <h2>Player</h2>
        <PlayPauseButton text={this.playPauseText()} />
        <audio id='asdf' ref="audio" preload={this.props.preload}>
          // <source src={this.src()} type={this.props.mimeType} />
        </audio>
        <div>Currently playing: {this.src()}</div>
      </div>
    )
  },
})

export default Player
