import tar from 'tar'
import path from 'path'

export default function downloadUpdate(ipfsClient, ipfsKey, basePath) {
  return ipfsClient.get(ipfsKey).then(tarStream => {
    return new Promise((resolve, reject) => {
      var outputPath = path.join(basePath, ipfsKey)
      tarStream.pipe(tar.Extract({ strip: 1, path: outputPath, mode: 0o755 }))
      .on('error', reject)
      .on('end', () => resolve(outputPath))
    })
  })
}
