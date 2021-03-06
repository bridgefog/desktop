import React from 'react'
import R from 'ramda'

import PlayIcon from '../components/play-icon'
import PauseIcon from '../components/pause-icon'
import playerActions from '../actions/player'

class PlayPauseButton extends React.Component {
  toggle() {
    playerActions.togglePlayPause()
  }

  buttonType() {
    return this.props.isPlaying ? <PauseIcon size="70" /> : <PlayIcon size="70" />
  }

  render() {
    var style = {
      padding: '0.5em',
      backgroundColor: '#C36351',
      borderRadius: '1em',
    }
    style = R.merge(style, this.props.style)

    return (
      <button style={style} onClick={this.toggle}>
        {this.buttonType()}
      </button>
    )
  }
}
PlayPauseButton.propTypes = {
  isPlaying: React.PropTypes.bool.isRequired
}

export default PlayPauseButton
