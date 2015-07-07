import React from 'react'
import actions from '../actions/tracks'

const placeholder = 'Search by artist or song title'

class SearchBar extends React.Component {
  updateSearch(event) {
    actions.updateSearchFilter(event.target.value.toLowerCase())
  }

  render() {
    var style = {
      padding: '1em',
      color: 'white',
      backgroundColor: '#333',
    }

    var inputStyle = {
      margin: 0,
      borderBottom: '1px #999 solid',
      color: 'white',
      padding: '0.4em 0',
      fontSize: '1.4em',
    }

    return (
      <div style={style}>
        <input type='search' style={inputStyle} placeholder={placeholder} onChange={this.updateSearch} />
      </div>
    )
  }
}

export default SearchBar
