'use strict'

var url = require('url')

exports.ipfsEndpoint = function (fallback) {
  if (process.env.ipfs_endpoint) {
    return url.parse(process.env.ipfs_endpoint)
  } else if (process.env.npm_package_config_ipfs_endpoint) {
    // configured endpoint default in package.json
    return url.parse(process.env.npm_package_config_ipfs_endpoint)
  } else if (global.ipfs_endpoint) {
    return url.parse(global.ipfs_endpoint)
  } else if (fallback) {
    return url.parse(fallback)
  } else {
    throw new Error('Could not determine IPFS endpoint')
  }
}

exports.p = function (value) {
  console.error(value)
  return value
}
