import { IPFSClient, DagObject, util as ipfsUtil } from 'atm-ipfs-api'
import R from 'ramda'
import { Set } from 'immutable'

var ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())

class Contents {
  constructor() {
    this.ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())
  }

  current() {
    return this.ipfs.nameResolveSelf()
      .then(publishedKey => this.ipfs.objectGet(publishedKey + '/allthemusic/contents'))
      .then(contentsNode => contentsNode.links.map(l => l.hash))
      .catch(err => {
        console.error('Failed to resolve current published contents')
        console.error(err.stack)
        return []
      })
  }

  publish(newMetadataKeys) {
    return this.current().then(currentKeys => {
      // console.log('curr:', currentKeys)
      var newContents = new Set(currentKeys).union(newMetadataKeys).toJS()
      return this.addDirectoryTree(newContents)
    }).then(newKey => {
      return ipfs.namePublish(newKey)
    })
  }

  addDirectoryTree(contents) {
    // console.log('contents', contents)
    var addLink = (contentsNode, key) => contentsNode.addLink(key, key)
    var contentsNode = R.reduce(addLink, new DagObject(), contents)
    // console.log('contentsNode', contentsNode)
    return ipfs.objectPut(contentsNode).then(contentsNodeHash => {
      return ipfs.objectPut(new DagObject().addLink('contents', contentsNodeHash))
    }).then(atmNodeHash => {
      return ipfs.objectPut(new DagObject().addLink('allthemusic', atmNodeHash))
    })
  }
}

export default Contents
