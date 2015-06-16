import React from 'react'

export default class PlayingStats extends React.Component {
  constructor(props) {
    super(props)
    this.onStatBarClick = this.onStatBarClick.bind(this)
    this.barHeight = 10
  }

  onStatBarClick(event) {
    console.log(event.clientX)
  }

  played() {
    var t = this._toTime(this.props.played)
    return `${t.h}:${t.m}:${t.s}`
  }

  length() {
    var t = this._toTime(this.props.length)
    return `${t.h}:${t.m}:${t.s}`
  }

  percentPlayed() {
    var percent = 100.0 / this.props.length
    console.log(percent)
    return Math.round(this.props.played * percent)
  }

  percentBuffered() {
    var percent = 100.0 / this.props.buffered
    console.log(percent)
    return Math.round(this.props.played * percent)
  }

  render() {
    if (!this.props.length) { return false }
    var statBarStyle = {
      backgroundColor: '#bbb',
      height: this.barHeight,
      width: '100%',
      padding: 0,
      margin: 0,
    }
    var playedBarStyle = {
      height: this.barHeight,
      backgroundColor: '#555',
      width: `${this.percentPlayed()}%`,
    }
    var bufferedBarStyle = {
      height: this.barHeight,
      backgroundColor: '#999',
      width: `${this.percentBuffered()}%`,
    }
    return (
      <div style={statBarStyle} onClick={this.onStatBarClick}>
        <div style={bufferedBarStyle}>
          <div style={playedBarStyle} />
        </div>
      </div>
    )
  }

  _toTime(seconds) {
    var hours = Math.floor(seconds / (60 * 60))

    var divisorForMinutes = seconds % (60 * 60)
    var minutes = Math.floor(divisorForMinutes / 60)

    var divisorForSeconds = divisorForMinutes % 60
    var seconds = Math.ceil(divisorForSeconds)

    return {
      h: hours,
      m: minutes,
      s: seconds,
    }
  }
}
