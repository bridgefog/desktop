import React from 'react'
import Peerlist from '../components/peerlist'
import Tracklist from '../components/tracklist'
import SearchBar from '../components/search-bar'
import Player from '../components/player'

class App extends React.Component {
  render () {
    var wrapperStyle = { paddingBottom: 150 }
    var style = { padding: '120px 1em 1em 1em', margin: 'auto' }

    return (
      <div style={wrapperStyle}>
        <div style={style}>
          <Tracklist />
          <div style={{ clear: 'both' }} />
        </div>
        <SearchBar />
        <Player />
      </div>
    )
  }
}

export default App
