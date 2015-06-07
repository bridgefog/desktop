import React from 'react'
import playerActions from '../actions/player'
import trackActions from '../actions/tracks'

var Track = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    artist: React.PropTypes.string,
    title: React.PropTypes.string,
  },

  handleClick() {
    playerActions.playTrack(this.props)
  },

  handleMouseOver() {
    trackActions.mouseOver(this.props.id)
  },

  handleMouseOut() {
    trackActions.mouseOut(this.props.id)
  },

  imgSrc() {
    return `http://localhost:8080/ipfs/${this.props.id}/image`
  },

  render() {
    var style = {
      width: 200,
      height: 240,
      padding: '0.5em',
      margin: '0.5em',
      float: 'left',
      color: 'black',
      backgroundColor: 'white',
      textAlign: 'center',
    }
    if (this.props.mousedOverTrackID == this.props.id) {
      style.outline = '2px solid yellow'
    }

    var artistStyle = { fontSize: 14 }
    var titleStyle = {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipis',
      fontSize: 10,
    }

    return (
      <li style={style}
          onClick={this.handleClick}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          >
        <div>
          <img src={this.imgSrc()} />
          <div style={artistStyle}>{this.props.artist}</div>
          <div style={titleStyle}>{this.props.title}</div>
        </div>
      </li>)
  },
})

export default Track
