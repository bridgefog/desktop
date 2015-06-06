import React from 'react'
import playerActions from '../actions/player'

var Track = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    artist: React.PropTypes.string,
    title: React.PropTypes.string,
  },

  handleClick() {
    playerActions.playTrack(this.props)
  },

  render() {
    var style = {
      width: 200,
      height: 200,
      padding: '1em',
      margin: '0.5em',
      float: 'left',
      color: 'black',
      backgroundColor: 'white',
    }

    return (
      <li style={style} onClick={this.handleClick}>
        <h4>{this.props.artist}</h4>
        <p>{this.props.title}</p>
      </li>)
  },
})

export default Track
