import react from 'react'
import trackStore from '../stores/tracks'

var el = react.createElement

var Tracklist = react.createClass({
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
    return el(
      'div', { className: 'Tracklist' },
      el('h2', null, 'Tracks'),
      el('table', null,
         el('thead', null,
            el('tr', null,
               el('th', null, 'Artist'),
               el('th', null, 'Title'))),
         el('tbody', null,
            this.state.tracks.map(track =>
              el('tr', null,
                el('td', null, track.artist),
                el('td', null, track.title))))))
  },
})

export default Tracklist
