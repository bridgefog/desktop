#!/bin/sh

set -x -e

prepare_dist() {
  ./node_modules/.bin/gulp dist
}

get_ipfs() {
  version=0.3.5
  filename="ipfs_v${version}_darwin-amd64.zip"
  url="https://gobuilder.me/get/github.com/ipfs/go-ipfs/cmd/ipfs/${filename}"

  mkdir -p tmp
  pushd tmp >&2

  test -f "${filename}" || curl -sSLO "${url}" >&2
  unzip -o "${filename}" >&2
  ipfs_path="$PWD/ipfs/ipfs"
  popd >&2
  if [ ! -x "${ipfs_path}" ]; then
    echo "IPFS was not obtained successfully"
    exit 1
  fi
  echo "${ipfs_path}"
}

copy_dot_app() {
  rm -rf pkg/app/BridgeFog.app
  mkdir -p pkg/app
  cp -a node_modules/electron-prebuilt/dist/Electron.app pkg/app/BridgeFog.app
  cp pkg/Info.plist pkg/app/BridgeFog.app/Contents/Info.plist
}

copy_dist_into_dot_app() {
  mkdir -pv pkg/app/BridgeFog.app/Contents/Resources/app
  rsync -aP --delete --include '/package.json' --include '/dist/***' --exclude '*' ./ ./pkg/app/BridgeFog.app/Contents/Resources/app/

  pushd ./pkg/app/BridgeFog.app/Contents/Resources/app/;
  export NODE_ENV=production
  npm install
  popd
}

copy_ipfs_into_dot_app() {
  ipfs_path="$1"
  mkdir -p ./pkg/app/BridgeFog.app/Contents/Resources/app/vendor;
  cp -a "$ipfs_path" ./pkg/app/BridgeFog.app/Contents/Resources/app/vendor;
}

package_dmg() {
  rm -f pkg/bridgefog.dmg
  hdiutil create -srcfolder pkg/app -volname BridgeFog pkg/BridgeFog.dmg
}

prepare_dist
ipfs_path=$(get_ipfs)
copy_dot_app
copy_dist_into_dot_app
copy_ipfs_into_dot_app
package_dmg
