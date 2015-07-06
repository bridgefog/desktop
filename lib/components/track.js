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
    return `http://localhost:4004/ipfs/${this.props.links.image}`
  },

  playPauseIcon() {
    const size = 180
    var style = {
      position: 'relative',
      top: 0 - (200 - size)/2 - size,
      pointerEvents: 'none',
    }

    if (this.props.isPlaying) {
      return <PauseIcon style={style} size={size} />
    } else {
      return <PlayIcon style={style} size={size} />
    }
  },

  render() {
    var styles = {
      main: {
        width: 200,
        // height: 260,
        paddingBottom: '0.5em',
        margin: '0 1em 1em 0',
        display: 'inline-block',
        color: '#ffffff',
        backgroundColor: '#1f1f1f',
        textAlign: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
      },
      title: {
        fontSize: '0.9em',
        paddingTop: '0.5em',
        lineHeight: '1.3em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        margin: '0 0.4em',
      },
      artist: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '0.8em',
        margin: '0.7em 0.4em 0',
      },
      imageContainer: {
        borderBottom: '2px solid black',
        height: 200,
        width: 200,
        overflow: 'hidden'
      },
      image: {
        backgroundColor: 'black',
        height: '100%', // scale imgs to fit
        opacity: this.props.isMousedOver ? 0.5 : 1,
        transition: 'opacity 0.1s',
      },
    }

    return (
      <div style={styles.main}
          onClick={this.handleClick}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          >
        <div style={styles.imageContainer}>
          <img style={styles.image} src={this.imgSrc()} />
          {this.props.isMousedOver ? this.playPauseIcon() : null}
        </div>
        <div style={styles.title} title={this.props.title}>{this.props.title}</div>
        <div style={styles.artist} title={this.props.artist}>{this.props.artist}</div>
      </div>
    )
  },
})

export default Track
