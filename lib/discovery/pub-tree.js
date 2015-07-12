import R from 'ramda'

import { UnnamedLinkCollection as LinksNode, Directory as DirNode } from '../ipfs-tree'

export default class PubTree {
  constructor({ tracks, peers, release }) {
    this.tracks = tracks || []
    this.peers = peers || []
    // this.release = release
  }

  publish(ipfsClient) {
    return this._addToIPFS(ipfsClient)
      .then(key => ipfsClient.namePublish(key))
  }

  _addToIPFS(ipfsClient) {
    return new DirNode({
      allthemusic: {
        contents: new LinksNode(this.tracks),
        peers: new LinksNode(this.peers),
        // release: this.release,
      },
    }).addToIPFS(ipfsClient)
  }
}
