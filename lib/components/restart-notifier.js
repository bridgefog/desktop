import React from 'react'
import appStatusActions from '../actions/app-status'

const messages = {
  needsRestart: 'Fog has been updated. ' +
    'Please click the Restart button to get the latest.',
  isRestarting: 'Restarting now...',
}

var styles = {
  container: {
    background: '#096899',
    padding: '0.25em 1em',
    display: 'flex',
  },
  button: {
    background: 'black',
    color: 'white',
    padding: '0.25em 1em',
    margin: '0',
    flex: '0 0 auto',
  },
  message: {
    lineHeight: '2em',
    flex: '1 0 auto',
  },
}

class RestartNotifier extends React.Component {
  render() {
    var button = null
    if (this._showRestartButton()) {
      button = (
        <button style={styles.button}
                onClick={appStatusActions.restartNow}>Restart</button>
      )
    }
    return (
      <div style={styles.container}>
        <p style={styles.message}>{this._message()}</p>
        {button}
      </div>
    )
  }

  _message() {
    return this._showRestartButton() ? messages.needsRestart : messages.isRestarting
  }

  _showRestartButton() {
    return this.props.needsRestart && !this.props.restarting
  }

}

export default RestartNotifier
