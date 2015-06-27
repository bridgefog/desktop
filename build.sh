#!/bin/sh

set -x -e

./node_modules/.bin/gulp dist

rm -rf pkg/app/Beam.app

mkdir -p pkg/app
cp -a node_modules/electron-prebuilt/dist/Electron.app pkg/app/Beam.app

mkdir -pv ./pkg/app/Beam.app/Contents/Resources/app
cp -v pkg/Info.plist pkg/app/Beam.app/Contents/Info.plist

rsync -aP --delete --include '/package.json' --include '/dist/***' --exclude '*' ./ ./pkg/app/Beam.app/Contents/Resources/app/

(
  cd ./pkg/app/Beam.app/Contents/Resources/app/;
  export NODE_ENV=production
  npm install
)

# Create the .dmg image
# size=$(du -sm pkg/app | awk '{ print $1 }')
# hdiutil create -size ${size} -fs HFS+ -volname "My Volume" myimg.dmg
rm -f pkg/beam.dmg
hdiutil create -srcfolder pkg/app -volname beam pkg/beam.dmg
