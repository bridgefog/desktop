# ATM Desktop app

This is an [Electron][]-based desktop app for AllTheMusic

## Development

```shell
source env.sh
make init
# to start the gulp bundle process, run
gulp
# in a separate shell, start electron
gulp electron
# hack
```

To avoid disowned and lost IPFS daemons, always kill the Electron app via Application Quit rather than `^C` to `gulp electron`

### ipfs-api

The [ipfs-api][] package contains a large amount of the logic needed by this
app. It's currently under very active development, so we recommend cloning and symlinking
your local copy into this package, for the time being. We hope to firm up the
API's soon so we can start merely referencing a semver-style version, but until
then:

1. Clone [ipfs-api][]
2. In the `ipfs-api` directory
    1. follow init instructions there
    2. run `npm link` [(see more about npm-link here)][npm-link]
3. In this directory, run `npm link atm-ipfs-api`

[electron]: https://github.com/atom/electron
[ipfs-api]: https://github.com/bridgefog/ipfs-api
[npm-link]: https://docs.npmjs.com/cli/link
