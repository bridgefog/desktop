import React from 'react'
import playerActions from '../actions/player'

var Track = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    artist: React.PropTypes.string,
    title: React.PropTypes.string,
  },

  handleClick() {
    playerActions.playTrack(this.props.id)
  },

  render() {
    var style = {
      width: 200,
      height: 200,
      border: '1px solid black',
      padding: '1em',
      margin: '0.5em',
      float: 'left',
    }

    return (
      <div style={style} onClick={this.handleClick}>
        <b>{this.props.artist}</b>
        <p>{this.props.title}</p>
      </div>)
  },
})

export default Track
