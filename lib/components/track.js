import React from 'react'
import PlayIcon from '../components/play-icon'
import PauseIcon from '../components/pause-icon'
import playerActions from '../actions/player'
import trackActions from '../actions/tracks'

var Track = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    artist: React.PropTypes.string,
    title: React.PropTypes.string,
    isMousedOver: React.PropTypes.bool,
  },

  handleClick() {
    if (this.props.isPlaying) {
      playerActions.togglePlayPause()
    } else {
      playerActions.playTrack(this.props)
    }
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

  playPauseIcon() {
    var style = {
      position: 'absolute',
      top: 10,
      left: 10,
      pointerEvents: 'none',
    }

    if (this.props.isPlaying) {
      return <PauseIcon style={style} size="180" />
    } else {
      return <PlayIcon style={style} size="180" />
    }
  },

  render() {
    var style = {
      position: 'relative',
      width: 200,
      height: 240,
      padding: 10,
      margin: 10,
      float: 'left',
      color: 'black',
      backgroundColor: 'white',
      textAlign: 'center',
    }
    var artistStyle = { fontSize: 14 }
    var titleStyle = {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipis',
      fontSize: 10,
    }
    var imageStyle = { backgroundColor: 'black' }

    if (this.props.isMousedOver) {
      style.cursor = 'pointer'
      imageStyle.opacity = '0.5'
    }

    return (
      <li style={style}
          onClick={this.handleClick}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          >
        <div>
          <div style={{ height: 180, backgroundColor: 'black' }}>
            <img style={imageStyle} src={this.imgSrc()} />
          </div>
          {this.props.isMousedOver ?  this.playPauseIcon() : null}
          <div style={artistStyle}>{this.props.artist}</div>
          <div style={titleStyle}>{this.props.title}</div>
        </div>
      </li>
    )
  },
})

export default Track
