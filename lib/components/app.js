import React from 'react'
import Peerlist from '../components/peerlist'
import Tracklist from '../components/tracklist'
import Player from '../components/player'

class App extends React.Component {
  render () {
    var wrapperStyle = { padding: '150, 0' }
    var style = { padding: '1em', margin: 'auto' }

    return (
      <div style={wrapperStyle}>
        <div style={style}>
          <Peerlist />
          <Tracklist />
          <div style={{ clear: 'both' }} />
        </div>
        <Player />
      </div>
    )
  }
}

export default App
