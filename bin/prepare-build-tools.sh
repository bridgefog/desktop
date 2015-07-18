#!/bin/bash

get_ipfs() {
  version=0.3.5
  os=$1
  arch=$2
  name="ipfs_v${version}_${os}-${arch}"
  filename="${name}.zip"
  url="https://gobuilder.me/get/github.com/ipfs/go-ipfs/cmd/ipfs/${filename}"

  mkdir -p tmp

  pushd tmp >&2
  test -f "${filename}" || curl -sSLO "${url}" >&2
  unzip -o "${filename}" -d "${name}" >&2
  ipfs_path="$PWD/${name}/ipfs"
  popd >&2
  if [ ! -x "${ipfs_path}/ipfs" ]; then
    echo "IPFS was not obtained successfully"
    exit 1
  fi
  echo "${ipfs_path}"
}

rm utils/ipfs-binary-dists.tsv
for os in darwin linux; do
  for arch in amd64 386; do
    path=$(get_ipfs $os $arch)
    key=$(ipfs add -r -q "${path}" | tail -n1)
    echo -e "$os\t$arch\t$key" >> utils/ipfs-binary-dists.tsv
  done
done
