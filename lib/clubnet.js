'use strict'

module.exports = function (ipfsClient) {
  function wearBadge(badge) {
    return ipfsClient.objectPut(badge.dagObject()).then(function (result) {
      badge.setHash(result)
      return badge
    })
  }

  function findPeers(badge) {
    // TODO: This is not the correct behavior, but for now, if we don't yet have
    // a hash stored in the badge, the only way to learn the hash is to add it
    // to IPFS
    var badgeP = badge.hash() ? Promise.resolve(badge) : wearBadge(badge)

    return badgeP.then(badge => ipfsClient.dhtFindprovs(badge.hash()))
  }

  return {
    wearBadge: wearBadge,
    findPeers: findPeers,
  }
}
