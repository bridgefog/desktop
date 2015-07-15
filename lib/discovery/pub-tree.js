import R from 'ramda'

import {
  IPFSNode,
  UnnamedLinkCollection as LinksNode,
  Directory as DirNode
} from '../ipfs-tree'

export default class PubTree {
  constructor({ tracks, peers, release }={}) {
    this.tracks = tracks || []
    this.peers = peers || []
    this.release = release
  }

  static fromIPFS(pubTreeKey, ipfsClient) {
    var pubTree = new PubTree()
    var gets = [
      ipfsClient.objectGet(pubTreeKey + '/allthemusic/contents'),
      ipfsClient.objectGet(pubTreeKey + '/allthemusic/peers'),
      // ipfsClient.objectGet(pubTreeKey + '/allthemusic/release'),
    ]
    return Promise.all(gets).then(([contents, peers, release]) => {
      pubTree.tracks = contents.links.map(l => l.hash).toJS()
      pubTree.peers = peers.links.map(l => l.hash).toJS()
      // pubTree.release = JSON.parse(release.data)
      return pubTree
    })
  }

  publish(ipfsClient) {
    return this._addToIPFS(ipfsClient)
      .then(key => ipfsClient.namePublish(key))
  }

  _addToIPFS(ipfsClient) {
    return new DirNode ({
      allthemusic: {
        contents: new LinksNode(this.tracks),
        peers: new LinksNode(this.peers),
        release: new IPFSNode({ data: JSON.stringify(this.release) }),
      },
    }).addToIPFS(ipfsClient)
  }
}
