import React from 'react'
import Track from '../components/track'
import trackStore from '../stores/track-store'

var Tracklist = React.createClass({
  getInitialState() {
    return trackStore.getState()
  },

  componentDidMount() {
    trackStore.listen(this.onChange)
  },

  componentWillUnmount() {
    trackStore.unlisten(this.onChange)
  },

  onChange(state) {
    this.setState(state)
  },

  render() {
    return (
      <ul>
        {this.state.tracks.map(track => (
          <Track id={track.id} artist={track.artist} title={track.title} />
        ))}
      </ul>
      )
  },
})

export default Tracklist
