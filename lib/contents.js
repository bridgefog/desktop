import { IPFSClient, DagObject, util as ipfsUtil } from 'atm-ipfs-api'
import R from 'ramda'

class Contents {
  constructor() {
    this.ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())
  }

  current() {
    return this.ipfs.nameResolveSelf()
      .then(publishedKey => this.ipfs.objectGet(publishedKey + '/allthemusic/contents'))
      .then(contentsNode => R.pluck('Hash', contentsNode.Links))
      .catch(err => {
        console.error('Failed to resolve current published contents')
        console.error(err.stack)
        return []
      })
  }
}

export default Contents
