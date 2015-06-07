FROM iojs:2.2.1

RUN apt-get update \
 && apt-get install -y \
      unzip

RUN curl -fsSLO https://gobuilder.me/get/github.com/ipfs/go-ipfs/cmd/ipfs/ipfs_master_linux-amd64.zip \
 && unzip ipfs_master_linux-amd64.zip \
 && mv -v ipfs/ipfs /usr/bin/ipfs \
 && rm -rfv ipfs/

RUN ipfs init

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install
COPY . /app

ENV PATH /app/node_modules/.bin:$PATH
RUN gulp dist

VOLUME /music
CMD ["bin/headless-node.js"]
