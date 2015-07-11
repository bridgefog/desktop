import fs from 'fs'
import path from 'path'
import { assert } from 'chai'
import rmrf from 'rmrf'
import Updater from '../../lib/updater'
import { IPFSClient, util as ipfsUtils } from 'atm-ipfs-api'

var exampleUpdates = {
  foo: {
    key: 'QmRy3mWi78DU5tYYMz7fZnxpzK6DZ6BxTQeHYn9w8ZyHpa',
    files: {
      'p/blah': 'bar\n',
      biz: 'baz\n',
    },
  }
}

describe('Updater', () => {
  describe('.downloadUpdate', () => {
    it('gets the IPFS key mentioned and puts it in a directory named by the key', () => {
      var example = exampleUpdates.foo
      var key = example.key
      var updater = new Updater({
        basePath: path.resolve('./tmp/app_updates'),
        ipfs: new IPFSClient(ipfsUtils.ipfsEndpoint()),
      })
      // clean tree before test
      rmrf(updater.basePath)

      return updater.downloadUpdate(key).then((updatePath) => {
        assert.equal(path.basename(updatePath), key)
        assert.equal(path.dirname(updatePath), updater.basePath)
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
})
