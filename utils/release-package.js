import path from 'path'
import http from 'http'
import fs from 'fs'

import gulpUtil from 'gulp-util'
import { IPFSClient, util as ipfsUtils } from 'atm-ipfs-api'
import packager from 'electron-packager'
import tar from 'tar'
import R from 'ramda'

var ipfsClient = new IPFSClient(ipfsUtils.ipfsEndpoint())

var targets = {
  darwin: {
    x64: {
      ipfsReleaseID: 'QmUuKeMKEpkzJrPXCbWfwvfxhU6xpurHTj4rkp9wah1pfd',
      ipfsVendorPath: './Fog.app/Contents/Resources/app/vendor/ipfs',
    },
  },
  linux: {
    x64: {
      ipfsReleaseID: 'QmPEmE1CaZjNLoFrDrSic4cJUDG6i8bAX68pQJ1rCZkbBH',
      ipfsVendorPath: './resources/app/vendor/ipfs',
    },
    ia32: {
      ipfsReleaseID: 'QmXjimrPrnoA3ZUwM4Dn6b3Gdp7VTUNR55vCUU1iHxiR46',
      ipfsVendorPath: './resources/app/vendor/ipfs',
    },
  },
}

class ReleasePackage {
  constructor({ os, arch, name, version, ipfsReleaseID, ipfsVendorPath, inputDir, outputDir, electronVersion }) {
    this.os = os
    this.arch = arch
    this.ipfsReleaseID = ipfsReleaseID
    this.ipfsVendorPath = ipfsVendorPath
    this.outputDir = outputDir
    this.electronVersion = electronVersion
    this.inputDir = inputDir
    this.version = version
    this.name = name

    this.packagerOpts = {
      dir: this.inputDir,
      name: 'Fog',
      platform: this.os,
      arch: this.arch,
      version: this.electronVersion,
      overwrite: true,
      out: this.outputDir,
      icon: path.resolve(__dirname, '../dist/music-512.icns'),
      'app-bundle-id': this.name,
      'helper-bundle-id': this.name + '.helper',
      'app-version': this.version,
      prune: true,
      protocols: [
        {
          name: this.name + '.url',
          schemes: ['fog'],
        },
      ],
      // 'version-string': { // windows-only
      //   CompanyName: '',
      //   LegalCopyright: '',
      //   FileDescription: '',
      //   OriginalFilename: '',
      //   FileVersion: '',
      //   ProductVersion: '',
      //   ProductName: '',
      //   InternalName: '',
      // }
    }
  }

  addIPFSBinaryToPackage() {
    return ipfsClient.get(this.ipfsReleaseID)
      .then(tarStream => {
        let outputPath = path.resolve(this.finalPath, this.ipfsVendorPath)
        return new Promise((resolve, reject) => {
          tarStream.pipe(tar.Extract({ strip: 1, path: outputPath, mode: 0o755 }))
            .on('error', reject)
            .on('end', () => resolve(outputPath))
        })
      })
      .then(outputPath => {
        fs.chmodSync(path.join(outputPath, 'ipfs'), 0o755)
      })
  }

  buildCombination() {
    return new Promise((resolve, reject) => {
      packager(this.packagerOpts, (err, appPaths) => {
        if (err) {
          reject(err)
        } else {
          this.finalPath = appPaths[0]
          gulpUtil.log('BUILD COMPLETE:', { os: this.os, arch: this.arch, path: this.finalPath })
          resolve(this.finalPath)
        }
      })
    })
  }
}

module.exports = function (opts) {
  opts = R.merge(targets[opts.os][opts.arch], opts)
  let pkg = new ReleasePackage(opts)
  return pkg.buildCombination().then(() => pkg.addIPFSBinaryToPackage())
}
