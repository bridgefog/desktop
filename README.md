# ATM Desktop app

This is an [Electron][]-based desktop app for AllTheMusic

## Development

Running tests assume you're already running IPFS locally, on the default port.

Get dependencies:
```shell
make init
```

To start the gulp bundle process, run:
```shell
source env.sh
# set up ipfs_endpoint variable to point to already running IPFS daemon used for tests
ipfs-select local
gulp
```

In a separate shell, start electron:
```shell
gulp electron
```

To avoid disowned and lost IPFS daemons, always kill the Electron app via Application Quit rather than `^C` to `gulp electron`

### If work on atm-ipfs-api is needed

It makes life easier to symlink your local `atm-ipfs-api` checkout to the `node_modules`
in `desktop`

1. Clone [ipfs-api][]
2. In the `ipfs-api` directory
    1. follow init instructions there
    2. run `npm link` [(see more about npm-link here)][npm-link]
3. In this directory, run `npm link atm-ipfs-api`

[electron]: https://github.com/atom/electron
[ipfs-api]: https://github.com/bridgefog/ipfs-api
[npm-link]: https://docs.npmjs.com/cli/link
