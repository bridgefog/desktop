import React from 'react'

class AudioElement extends React.Component {
  constructor(props) {
    super(props)
  }

  play() {
    this._audio().play()
  }

  pause() {
    this._audio().pause()
  }

  componentDidMount() {
    // this._addDebugListeners()
    this.props.isPlaying ? this.play() : this.pause()
  }

  componentDidUpdate(prevProps) {
    this.props.isPlaying ? this.play() : this.pause()
  }

  render() {
    return <audio ref="audio" src={this._src()} />
  }

  _addDebugListeners() {
    var audio = this._audio()
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
  }

  _audio() {
    return this.refs.audio.getDOMNode()
  }

  _src() {
    if (this.props.playingID === undefined) { return null }
    return `http://localhost:8080/ipfs/${this.props.playingID}/file`
  }
}

export default AudioElement
