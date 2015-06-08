import React from 'react'

var PlayIcon = React.createClass({
  render() {
    return (
      <svg style={this.props.style} width={this.props.size} height={this.props.size} viewBox="0 0 100 100" fill="white">
        <circle cx="35" cy="20" r="3"/><circle cx="35" cy="30" r="3"/><circle cx="35" cy="40" r="3"/>
        <circle cx="55" cy="40" r="3"/><circle cx="35" cy="50" r="3"/><circle cx="55" cy="50" r="3"/>
        <circle cx="65" cy="50" r="3"/><circle cx="35" cy="60" r="3"/><circle cx="55" cy="60" r="3"/>
        <circle cx="35" cy="70" r="3"/><circle cx="35" cy="80" r="3"/><circle cx="45" cy="40" r="3"/>
        <circle cx="45" cy="50" r="3"/><circle cx="45" cy="60" r="3"/><circle cx="45" cy="30" r="3"/>
        <circle cx="45" cy="70" r="3"/>
      </svg>
    )
  }
})

export default PlayIcon
