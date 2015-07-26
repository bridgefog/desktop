FROM iojs:2.2.1

ENV NPM_CONFIG_LOGLEVEL warn

# Don't install optional packages (Electron)
ENV NPM_CONFIG_OPTIONAL false

# fix issue with 'cannot run in wd'
ENV NPM_CONFIG_UNSAFE_PERM true

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/

COPY packages/hash-decorator/package.json /app/packages/hash-decorator/

RUN npm install

ENV PATH /app/bin:/app/node_modules/.bin:$PATH
COPY ./ /app/

RUN npm install
RUN npm run prepublish

ENTRYPOINT ["docker-wrapper"]
