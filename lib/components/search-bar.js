import React from 'react'
import actions from '../actions/tracks'

const placeholder = 'Search by artist or song title'

class SearchBar extends React.Component {
  updateSearch(event) {
    actions.updateSearchFilter(event.target.value.toLowerCase())
  }

  render() {
    var style = {
      position: 'fixed',
      top: 0,
      padding: '1em',
      color: 'white',
      backgroundColor: '#333',
      width: '100%',
    }

    var inputStyle = {
      margin: 0
    }

    return (
      <div style={style}>
        <input type='text' style={inputStyle} placeholder={placeholder} onChange={this.updateSearch} />
      </div>
    )
  }
}

export default SearchBar
