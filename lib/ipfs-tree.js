import { Map, Set } from 'immutable'
import { DagObject } from 'atm-ipfs-api'

// Provides high-level interface for constructing and adding large tree into IPFS as DagObjects
export class IPFSNode {
  constructor({ data, links }={}) {
    this.data = data || null
    this.links = new Set(links)
  }

  publish(ipfsClient) {
    return this.ipfsKey(ipfsClient)
      .then(key => ipfsClient.namePublish(key))
  }

  ipfsKey(ipfsClient) {
    return this.addToIPFS(ipfsClient)
  }

  addToIPFS(ipfsClient) {
    return this.toDagObject(ipfsClient)
      .then(obj => ipfsClient.objectPut(obj))
  }

  toDagObject(ipfsClient) {
    var obj = new DagObject({ data: this.data })
    var promises = this.links.map(([name, linkedObj]) => {
      return linkedObj.ipfsKey(ipfsClient).then(key => {
        obj = obj.addLink(name, key)
      })
    })
    return Promise.all(promises).then(() => obj)
  }
}

class IPFSKeyRef extends IPFSNode {
  constructor(key) {
    super()
    this._key = key
  }

  addToIPFS(ipfsClient) {
    return Promise.resolve(this._key)
  }

  toDagObject(ipfsClient) {
    return Promise.reject(new Error('This cannot be represented as a DagObject'))
  }
}

export class Directory extends IPFSNode {
  // tree is an object-tree, likely with plain object values in a deeply nested
  // fashion. leaves all should be of atm-ipfs-api.DagObject type
  constructor(tree) {
    super()

    this.links = this.links.withMutations(links => {
      for (var name in tree) {
        var entry = tree[name]
        if (!entry) { continue }
        if (!(entry instanceof IPFSNode)) {
          if (typeof entry === 'string') {
            entry = new IPFSKeyRef(entry)
          } else {
            entry = new Directory(entry)
          }
        }
        links.add([name, entry])
      }
    })
  }
}

// builds a DAG node which is just a collection of unnamed links
export class UnnamedLinkCollection extends IPFSNode {
  constructor(collection) {
    super()

    this.links = this.links.withMutations(links => {
      collection.forEach(entry => {
        if (!entry) { return }
        if (!(entry instanceof IPFSNode)) {
          if (typeof entry === 'string') {
            entry = new IPFSKeyRef(entry)
          } else {
            throw new Error('wtf is this??', entry)
          }
        }
        links.add(['', entry])
      })
    })
  }
}
