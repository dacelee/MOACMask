# MOACMask Browser Extension for MOAC

## Support

If you're a user seeking support, [leave your feedbacks at our GIT site](https://github.com/dacelee/MOACMask/).
 [Firefox] https://addons.mozilla.org/zh-CN/firefox/addon/moacmask/
## Introduction

In order to help users and developers access MOAC blockchain, we modified the [MetaMask Project](https://metamask.io/) to make it work with MOAC blockchain. MOAC blockchain JSON-RPC is compatiable with Ethereum WEB3 in many methods but is quite different in Transaction Format. Major changes are as the followings:
- Use moac-tx to replace the ethereumjs-tx for sign a raw transaction object;
- Use moac-provider-engine to replace the web3-provider-enginer for sending a signed Transaction to MOAC network;
- Use moac-link to provide outside link with MOAC explorer for displaying account info.
- Connect with https://moacwalletonline.com instead of infurno.io to provide online services.

MoacMask is a software for users to manage accounts, for sites to easily propose actions to users, and for users to coherently review actions before approving them. We build on this rapidly evolving set of protocols with the goal of empowering the most people to the greatest degree, and aspire to continuously evolve our offering to pursue that goal.


## Developing Compatible Dapps

If you're a web dapp developer, we welcome you to join us to further develop this tool:

### New Dapp Developers

- We recommend this [Learning Solidity](https://karl.tech/learning-solidity-part-1-deploy-a-contract/) tutorial series by Karl Floersch.
- MetaMask team wrote a gentle introduction on [Developing Dapps with Truffle and MetaMask](https://medium.com/metamask/developing-ethereum-dapps-with-truffle-and-metamask-aa8ad7e363ba).

### Current Dapp Developers

- If you have a Dapp on Ethereum, and you want to move to MOAC network, you can checkout our website for further development.
- At this moment, MOACMask only supports MotherChain Dapps, MicroChain supports is under developing.

## Building locally

 - Install [Node.js](https://nodejs.org/en/) version 6.3.1 or later.
 - Install dependencies:
   - For node versions up to and including 9, install local dependencies with `npm install`.
   - For node versions 10 and later, install [Yarn](https://yarnpkg.com/lang/en/docs/install/) and use `yarn install`.
 - Install gulp globally with `npm install -g gulp-cli`.
 - Build the project to the `./dist/` folder with `gulp build`.
 - Optionally, to rebuild on file changes, run `gulp dev`.
 - To package .zip files for distribution, run `gulp zip`, or run the full build & zip with `gulp dist`.

 Uncompressed builds can be found in `/dist`, compressed builds can be found in `/builds` once they're built.

### Running Tests

Requires `mocha` installed. Run `npm install -g mocha`.

Then just run `npm test`.

You can also test with a continuously watching process, via `npm run watch`.

You can run the linter by itself with `gulp lint`.

## Development

```bash
npm install
npm start
```

## Build for Publishing

```bash
npm run dist
```

#### Writing Browser Tests

To write tests that will be run in the browser using QUnit, add your test files to `test/integration/lib`.

## Other Docs

- [How to add custom build to Chrome](./docs/add-to-chrome.md)
- [How to add custom build to Firefox](./docs/add-to-firefox.md)
- [How to add new networks to the Provider Menu](./docs/adding-new-networks.md)
- [How to add a new translation to MOACMask](./docs/translating-guide.md)
- [How to develop an in-browser mocked UI](./docs/ui-mock-mode.md)
- [How to develop a live-reloading UI](./docs/ui-dev-mode.md)
- [How to live reload on local dependency changes](./docs/developing-on-deps.md)


