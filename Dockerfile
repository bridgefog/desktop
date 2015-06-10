FROM iojs:2.2.1

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install
COPY . /app

ENV PATH /app/node_modules/.bin:$PATH
RUN gulp dist

VOLUME /music
CMD ["bin/headless-node.js"]
