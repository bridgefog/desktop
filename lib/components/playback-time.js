import React from 'react'
import actions from '../actions/player'

export default class PlaybackTime extends React.Component {
  constructor(props) {
    super(props)
  }

  played() {
    var t = this._toTime(this.props.played)
    return `${t.m}:${t.s}`
  }

  length() {
    var t = this._toTime(this.props.length)
    return `${t.m}:${t.s}`
  }

  render() {
    if (!this.props.length) { return null }

    return (
      <div style={this.props.style}>
        {this.played()} / {this.length()}
      </div>
    )
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
