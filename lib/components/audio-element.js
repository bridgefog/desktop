import React from 'react'
import actions from '../actions/player'

class AudioElement extends React.Component {
  constructor(props) {
    super(props)
    this._updateStats = this._updateStats.bind(this)
    this._trackEnded = this._trackEnded.bind(this)
  }

  play() {
    this._audio().play()
  }

  pause() {
    this._audio().pause()
  }

  componentDidMount() {
    this._audio().addEventListener('timeupdate', this._updateStats)
    this._audio().addEventListener('ended', this._trackEnded)
    // this._addDebugListeners()
    this.props.isPlaying ? this.play() : this.pause()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.setCurrentTime != this.props.setCurrentTime) {
      this._setCurrentTime()
    }
    if (this._shouldChangePlayState(prevProps)) {
      this.props.isPlaying ? this.play() : this.pause()
    }
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
    audio.addEventListener('play', () => console.log('Track play'))
    audio.addEventListener('playing', () => console.log('Track playing'))
    audio.addEventListener('timeupdate', () => console.log('Track timeupdate'))
    audio.addEventListener('pause', () => console.log('Track paused'))
    audio.addEventListener('progress', () => {
      var progress = audio.buffered.end(0) / audio.duration
      console.log('Track buffering progress:', progress * 100)
      console.log('Duration:', audio.duration)
      console.log('Played:', audio.played.end(0))
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
    return `http://localhost:4004/ipfs/${this.props.playingID}/file`
  }

  _updateStats() {
    if (this.props.playingID === undefined) { return null }
    actions.updatePlayingStats({
      length: this._audio().duration,
      played: this._audio().currentTime,
    })
  }

  _trackEnded() {
    actions.trackEnded(this.props.playingID)
  }

  _setCurrentTime() {
    this._audio().currentTime = this.props.setCurrentTime
  }

  _shouldChangePlayState(prevProps) {
    return (prevProps.isPlaying != this.props.isPlaying) || (prevProps.playingID != this.props.playingID)
  }
}

export default AudioElement
