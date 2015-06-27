import React from 'react'
import actions from '../actions/player'

export default class PlayingStats extends React.Component {
  constructor(props) {
    super(props)
    this.onStatBarClick = this.onStatBarClick.bind(this)
    this.barHeight = 10
  }

  onStatBarClick(event) {
    var percentClicked = (event.clientX / this._width()) * 100
    var songSeconds = (percentClicked / 100) * this.props.length
    actions.setCurrentTime(songSeconds)
  }

  played() {
    var t = this._toTime(this.props.played)
    return `${t.m}:${t.s}`
  }

  length() {
    var t = this._toTime(this.props.length)
    return `${t.m}:${t.s}`
  }

  percentPlayed() {
    var percent = 100.0 / this.props.length
    return Math.floor(this.props.played * percent * 100) / 100
  }

  render() {
    if (!this.props.length) { return false }

    var statBarStyle = {
      backgroundColor: '#d0d0d0',
      borderBottom: '2px solid #111111',
      height: this.barHeight,
      width: '100%',
      padding: 0,
      margin: 0,
      clear: 'both',
      cursor: 'pointer',
    }

    var playedBarStyle = {
      height: this.barHeight,
      backgroundColor: '#252525',
      width: `${this.percentPlayed()}%`,
    }

    return (
      <div>
        <div ref="statBar" style={statBarStyle} onClick={this.onStatBarClick}>
          <div style={playedBarStyle} />
        </div>
        <div style={{ padding: '2 10 2 2', float: 'right' }}>
          {this.played()} / {this.length()}
        </div>
      </div>
    )
  }

  _width() {
    return this._statBar().offsetWidth
  }

  _statBar() {
    return this.refs.statBar.getDOMNode()
  }

  _toTime(seconds) {
    var hours = Math.floor(seconds / (60 * 60))

    var divisorForMinutes = seconds % (60 * 60)
    var minutes = Math.floor(divisorForMinutes / 60)
    if (minutes < 10) { minutes = '0' + minutes }

    var divisorForSeconds = divisorForMinutes % 60
    var seconds = Math.floor(divisorForSeconds)
    if (seconds < 10) { seconds = '0' + seconds }

    return {
      h: hours,
      m: minutes,
      s: seconds,
    }
  }
}
