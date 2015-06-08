import React from 'react'

var PauseIcon = React.createClass({
  render() {
    return (
      <svg style={this.props.style} width={this.props.size} height={this.props.size} viewBox="0 0 100 100" fill="white">
        <circle cx="30" cy="20" r="3"/><circle cx="40" cy="20" r="3"/><circle cx="60" cy="20" r="3"/>
        <circle cx="70" cy="20" r="3"/><circle cx="30" cy="30" r="3"/><circle cx="40" cy="30" r="3"/>
        <circle cx="60" cy="30" r="3"/><circle cx="70" cy="30" r="3"/><circle cx="30" cy="40" r="3"/>
        <circle cx="40" cy="40" r="3"/><circle cx="60" cy="40" r="3"/><circle cx="70" cy="40" r="3"/>
        <circle cx="30" cy="50" r="3"/><circle cx="40" cy="50" r="3"/><circle cx="60" cy="50" r="3"/>
        <circle cx="70" cy="50" r="3"/><circle cx="30" cy="60" r="3"/><circle cx="40" cy="60" r="3"/>
        <circle cx="60" cy="60" r="3"/><circle cx="70" cy="60" r="3"/><circle cx="30" cy="70" r="3"/>
        <circle cx="40" cy="70" r="3"/><circle cx="60" cy="70" r="3"/><circle cx="70" cy="70" r="3"/>
        <circle cx="30" cy="80" r="3"/><circle cx="40" cy="80" r="3"/><circle cx="60" cy="80" r="3"/>
        <circle cx="70" cy="80" r="3"/>
      </svg>
    )
  }
})

export default PauseIcon
