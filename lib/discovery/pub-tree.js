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
    this.release = release || null
  }

  static fromIPFS(pubTreeKey, ipfsClient) {
    var pubTree = new PubTree()

    var contents = ipfsClient.objectGet(pubTreeKey + '/allthemusic/contents')
      .then(dagNode => dagNode.links.map(l => l.hash).toJS())
      .catch(err => [])

    var peers = ipfsClient.objectGet(pubTreeKey + '/allthemusic/peers')
      .then(dagNode => dagNode.links.map(l => l.hash).toJS())
      .catch(err => [])

    var release = ipfsClient.objectGet(pubTreeKey + '/allthemusic/release')
      .then(dagNode => JSON.parse(dagNode.data))
      .catch(() => null)

    return Promise.all([contents, peers, release]).then(([contents, peers, release]) => {
      pubTree.tracks = contents
      pubTree.peers = peers
      if (release) {
        pubTree.release = release
      }
      return pubTree
    })
  }

  publish(ipfsClient) {
    return this.addToIPFS(ipfsClient)
      .then(key => ipfsClient.namePublish(key))
  }

  addToIPFS(ipfsClient) {
    return this.toIPFSTree().addToIPFS(ipfsClient)
  }

  toIPFSTree() {
    return new DirNode ({
      allthemusic: {
        contents: new LinksNode(this.tracks),
        peers: new LinksNode(this.peers),
        release: this.release ? new IPFSNode({ data: JSON.stringify(this.release) }) : null,
      },
    })
  }
}
