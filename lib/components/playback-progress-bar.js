import React from 'react'
import actions from '../actions/player'

const barHeight = '0.5em'

export default class PlaybackProgressBar extends React.Component {
  constructor(props) {
    super(props)
    this.onStatBarClick = this.onStatBarClick.bind(this)
  }

  onStatBarClick(event) {
    var fraction = event.clientX / this._width()
    var songSeconds = fraction * this.props.length
    actions.setCurrentTime(songSeconds)
  }

  percentPlayed() {
    return this.props.played / this.props.length * 100
  }

  render() {
    if (!this.props.length) { return false }

    var styles = {
      statBar: {
        backgroundColor: '#868484',
        borderBottom: '2px solid #111111',
        height: barHeight,
        cursor: 'pointer',
      },
      playedBar: {
        height: barHeight,
        backgroundColor: '#dadada',
        width: `${this.percentPlayed()}%`,
        transition: 'width 0.3s', // smooth bar movement as time updates happen
      },
    }

    return (
      <div ref="statBar" style={styles.statBar} onClick={this.onStatBarClick}>
        <div style={styles.playedBar} />
      </div>
    )
  }

  _width() {
    return this._statBar().offsetWidth
  }

  _statBar() {
    return this.refs.statBar.getDOMNode()
  }
}
