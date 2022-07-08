# Developer Documentation

This directory contains documentation for developers.

## Theory of Operation

This app provides a bridge between the Web 2.0 REST API world and the Web3.0 IPFS world. Web apps (like wallet.fullstack.cash) can interact with the REST API provided by the this web server app. This app then pulls the back-end infrastructure through a the IPFS network.

When started, this app will spin up an IPFS node and connect to the PSF network using [ipfs-coord](https://www.npmjs.com/package/ipfs-coord). It will find and connect with a BCH wallet service provider via IPFS. Clients connecting to the REST API can then access BCH wallet infrastructure via the REST API.

More details at [CashStack.info](https://cashstack.info).
