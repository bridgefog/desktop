import React from 'react'
import actions from '../actions/tracks'

export default class SearchBar extends React.Component {

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

    return (
      <div style={style}>
        <input type='text' placeholder='Search all the music' onChange={this.updateSearch} />
      </div>
    )
  }
}
