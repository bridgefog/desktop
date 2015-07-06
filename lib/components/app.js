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
    var containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    }
    var headerStyle = {
      flex: '0 0 auto',
    }
    var sectionStyle = {
      flex: '1 1 auto',
      minHeight: 0,
      overflow: 'auto',
    }
    var footerStyle = {
      flex: '0 0 auto',
    }

    var restartNotifier = this.state.needsRestart ? <RestartNotifier {...this.state} /> : null

    return (
      <div style={containerStyle} className='app'>
        <header style={headerStyle}>
          <SearchBar />
          { restartNotifier }
        </header>
        <section style={sectionStyle}>
          <Tracklist />
        </section>
        <footer style={footerStyle}>
          <Player />
        </footer>
      </div>
    )
  }
}

export default App
