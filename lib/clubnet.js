'use strict'

module.exports = function (ipfsClient) {
  function wearBadge(badge) {
    return ipfsClient.objectPut(badge.dagObject()).then(function (result) {
      badge.setHash(result.Hash)
      return badge
    })
  }

  function findPeers(badge) {
    // TODO: This is not the correct behavior, but for now, if we don't yet have
    // a hash stored in the badge, the only way to learn the hash is to add it
    // to IPFS
    return (
      badge.hash() ? Promise.resolve(badge) : wearBadge(badge)
    ).then(function (badge) {
      return ipfsClient.dhtFindprovs(badge.hash())
    })
  }

  return {
    wearBadge: wearBadge,
    findPeers: findPeers,
  }
}
