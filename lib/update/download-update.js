import os from 'os'
import path from 'path'
import tar from 'tar'

export default function downloadUpdate(ipfsClient, ipfsKey, basePath) {
  var outputPath = path.join(basePath, ipfsKey)
  return ipfsClient.get(ipfsPathForReleaseKey(ipfsKey)).then(tarStream => {
    return new Promise((resolve, reject) => {
      tarStream.pipe(tar.Extract({ strip: 1, path: outputPath, mode: 0o755 }))
        .on('error', reject)
        .on('end', () => resolve(outputPath))
    })
  })
}

function ipfsPathForReleaseKey(ipfsKey) {
  return `${ipfsKey}/${os.type()}-${os.arch()}`
}
