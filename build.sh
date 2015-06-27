#!/bin/sh

set -x -e

./node_modules/.bin/gulp dist

rm -rf pkg/Beam.app

cp -a node_modules/electron-prebuilt/dist/Electron.app pkg/Beam.app

mkdir -pv ./pkg/Beam.app/Contents/Resources/app
cp -v pkg/Info.plist pkg/Beam.app/Contents/Info.plist

rsync -aP --delete --include '/package.json' --include '/dist/***' --exclude '*' ./ ./pkg/Beam.app/Contents/Resources/app/

(
  cd ./pkg/Beam.app/Contents/Resources/app/;
  export NODE_ENV=production
  npm install
)
