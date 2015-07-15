import fs from 'fs'
import path from 'path'
import { assert } from 'chai'
import rmrf from 'rmrf'
import downloadUpdate from '../../../lib/update/download-update'
import { IPFSClient, util as ipfsUtils } from 'atm-ipfs-api'

var exampleUpdates = {
  foo: {
    key: 'QmTAf6e33Mc2RvTq6op4vj13NhNv7feLxfSWgE5kGVS9vo',
    files: {
      'p/blah': 'bar\n',
      biz: 'baz\n',
    },
  }
}

describe('downloadUpdate', () => {
  it('gets the IPFS key mentioned and puts it in a directory named by the key', () => {
    var example = exampleUpdates.foo
    var key = example.key
    var ipfsClient = new IPFSClient(ipfsUtils.ipfsEndpoint())
    // clean tree before test
    var basePath = path.resolve('./tmp/app_updates')
    rmrf('./tmp/app_updates')

    return downloadUpdate(ipfsClient, key, basePath).then((updatePath) => {
      assert.equal(path.basename(updatePath), key)
      assert.equal(path.dirname(updatePath), basePath)
      assert(fs.statSync(updatePath).isDirectory())

      for (var childPath in example.files) {
        var fullPath = path.join(updatePath, childPath)
        var expectedContents = example.files[childPath]

        assert(fs.statSync(fullPath).isFile())
        assert.equal(fs.readFileSync(fullPath).toString(), expectedContents)
      }
    })
  })
})
