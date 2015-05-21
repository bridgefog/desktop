import react from 'react'
import peerStore from '../stores/peers'

var el = react.createElement

var Peerlist = react.createClass({
  getInitialState() {
    return peerStore.getState()
  },

  componentDidMount() {
    peerStore.listen(this.onChange)
  },

  componentWillUnmount() {
    peerStore.unlisten(this.onChange)
  },

  onChange(state) {
    this.setState(state)
  },

  render() {
    return el(
      'div', { className: 'Peerlist' },
      el('h2', null, 'Peers'),
      el('table', null,
         el('thead', null,
            el('tr', null,
               el('th', null, 'ID'),
               el('th', null, 'Status'),
               el('th', null, 'Last Seen'))),
         el('tbody', null,
            this.state.peers.map(peer =>
              el('tr', null,
                el('td', null, peer.key),
                el('td', null, peer.status),
                el('td', null, peer.lastSeen))))))
  },
})

export default Peerlist
