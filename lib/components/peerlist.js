import React from 'react'
import peerStore from '../stores/peer-store'
import decorateHash from '../hash-decorator'

class PeerRow extends React.Component {
  render() {
    return (
      <tr>
        <td>{decorateHash(this.props.id)}</td>
        <td>{this.props.status}</td>
        <td>{this.props.lastSeen}</td>
      </tr>
    )
  }
}

class Peerlist extends React.Component {
  constructor(props) {
    super(props)
    this.state = peerStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    peerStore.listen(this.onChange)
  }

  componentWillUnmount() {
    peerStore.unlisten(this.onChange)
  }

  onChange(state) {
    this.setState(state)
  }

  render() {
    var style = { clear: 'both' }

    return (
      <div style={style}>
        <h2>Peers</h2>
        <table>
          <thead><tr><th>ID</th><th>Status</th><th>Last Seen</th></tr></thead>
          <tbody>
          {this.state.peers.toArray().map(peer => (
            <PeerRow key={peer.key} id={peer.key} status={peer.status} lastSeen={peer.lastSeen} />
          ))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Peerlist
