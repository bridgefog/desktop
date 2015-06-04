import React from 'react'
import peerStore from '../stores/peer-store'

var Peerlist = React.createClass({
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
    var style = { clear: 'both' }

    return (
      <div style={style}>
        <h2>Peers</h2>
        <table>
          <thead><tr><th>ID</th><th>Status</th><th>Last Seen</th></tr></thead>
          <tbody>
          {this.state.peers.map(peer => (
            <tr><td>{peer.key}</td><td>{peer.status}</td><td>{peer.lastSeen}</td></tr>
          ))}
          </tbody>
        </table>
      </div>
    )
  },
})

export default Peerlist
