# ATM HTML/JS application

This is the client-side HTML/JS application which targets multiple browsers.
Presently, development focuses on supporting running within [Electron][], but
ultimately we'd like to maintain support for most modern browsers.

## Development

1. See [`../README.md`][parent-readme] first
2. Run `make init`

### atm-common

The [atm-common][] package contains a large amount of the logic needed by this
app. It's currently under very active development, so we recommend cloning and symlinking
your local copy into this package, for the time being. We hope to firm up the
API's soon so we can start merely referencing a semver-style version, but until
then:

1. Clone [atm-common][]
2. In the `atm-common` directory
    1. follow init instructions there
    2. run `npm link` [(see more about npm-link here)][npm-link]
3. In this directory, run `npm link atm-common`

[electron]: https://github.com/atom/electron
[parent-readme]: ../README.md
[atm-common]: https://github.com/allthemusic/atm-common
[npm-link]: https://docs.npmjs.com/cli/link
