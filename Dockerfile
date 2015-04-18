from iojs:slim

run mkdir -p /usr/src/app
workdir /usr/src/app

copy package.json /usr/src/app/
copy node_modules/ /usr/src/app/node_modules
run npm install
copy . /usr/src/app

env PATH /usr/src/app/bin:/usr/src/app/node_modules/.bin:$PATH

entrypoint ["scripts/docker-wrapper"]
cmd ["gulp"]
