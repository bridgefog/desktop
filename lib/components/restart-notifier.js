import React from 'react'
import appStatusActions from '../actions/app-status'

var style = {
  background: '#C36351',
  height: '2em',
  padding: '0 1em',
}
var buttonStyle = {
  float: 'right',
  height: '1.5em',
  background: 'black',
  color: 'white',
  padding: '0 1em',
  margin: '0.25em 0',
}
var messageStyle = {
  lineHeight: '2em',
}

class RestartNotifier extends React.Component {
  render() {
    var showRestartButton = this.props.needsRestart && !this.props.restarting
    var message = showRestartButton ? 'FogHorn has been updated. Please click here to restart.' : 'Restarting now...'

    return (
      <div style={style}>
      { showRestartButton ? <button style={buttonStyle} onClick={appStatusActions.restartNow}>Restart</button> : null }
        <p style={messageStyle}>{message}</p>
      </div>
    )
  }
}

export default RestartNotifier
