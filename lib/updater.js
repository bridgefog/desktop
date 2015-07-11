import tar from 'tar'
import path from 'path'

export default class Updater {
  constructor({ ipfs, basePath }) {
    this.ipfs = ipfs
    this.basePath = basePath
  }

  downloadUpdate(ipfsKey) {
    return this.ipfs.get(ipfsKey).then(tarStream => {
      return new Promise((resolve, reject) => {
        var outputPath = path.join(this.basePath, ipfsKey)
        tarStream.pipe(tar.Extract({ strip: 1, path: outputPath, mode: 0o755 }))
          .on('error', reject)
          .on('end', () => resolve(outputPath))
      })
    })
  }
}
