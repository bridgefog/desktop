import React from 'react'
import Peerlist from '../components/peerlist'
import Tracklist from '../components/tracklist'
import SearchBar from '../components/search-bar'
import RestartNotifier from '../components/restart-notifier'
import Player from '../components/player'
import appStatusStore from '../stores/app-status-store'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = appStatusStore.getState()
  }

  componentDidMount() {
    appStatusStore.listen(state => this._onChange(state))
  }

  componentWillUnmount() {
    appStatusStore.listen(state => this._onChange(state))
  }

  _onChange(state) {
    this.setState(state)
  }

  render () {
    var wrapperStyle = { paddingBottom: 150 }
    var style = { padding: '71px 0 0 0', margin: 'auto' }

    return (
      <div style={wrapperStyle}>
        <div style={style}>
          <Tracklist />
          <div style={{ clear: 'both' }} />
        </div>
        <SearchBar />
        { this.state.needsRestart ? <RestartNotifier {...this.state} /> : null }
        <Player />
      </div>
    )
  }
}

export default App
