# ipfs-bch-wallet-consumer

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

This is a REST API server based on [Koa](https://koajs.com/). It's essentially a mirror image of [ipfs-bch-wallet-service](https://github.com/Permissionless-Software-Foundation/ipfs-bch-wallet-service). Where ipfs-bch-wallet-service is intended to be coupled to [bch-api](https://github.com/Permissionless-Software-Foundation/bch-api) to _provide_ blockchain service, ipfs-bch-wallet-consumer provides a localized REST API for _consuming_ that blockchain service.

When started, this web server starts an [IPFS](https://ipfs.io) node and connects to an ipfs-bch-wallet-service server over the IPFS network. It then pipes that connection over its own localized REST API.

More details are available at [CashStack.info](https://CashStack.info).

- [Video: Using ipfs-bch-wallet-consumer](https://youtu.be/7ntMPuqAX64)

## Requirements

- node **^16.20.2**
- npm **^8.19.4**
- Docker **^20.10.8**
- Docker Compose **^1.27.4**

## Installation

### Development Environment

To run this software, you must have an instance of go-ipfs running in daemon mode, with the `--enable-pubsub-experiment` flag set. [Here are instruction for installing go-ipfs](https://gist.github.com/christroutner/a39f656850dc022b60f25c9663dd1cdd#install-ipfs).

Clone this repository and install npm dependencies. You'll also need to install MongoDB if you don't already have it installed:

```bash
git clone https://github.com/Permissionless-Software-Foundation/ipfs-bch-wallet-consumer
cd ipfs-bch-wallet-consumer
./install-mongo-sh
sudo npm install -g node-pre-gyp
npm install
cd shell-script
./local-external-ipfs-node.sh
```

### Production Environment

The [docker](./production/docker) directory contains a Dockerfile for building a production deployment.

```
docker-compose pull
docker-compose up -d
```

- You can bring the containers down with `docker-compose down`
- You can bring the containers back up with `docker-compose up -d`.

## Configuration

This program is intended to started with a Bash shell script. In that script, you can set the following environment variables:

```bash
# The IPFS ID of the service running ipfs-bch-wallet-service
export PREFERRED_P2WDB_PROVIDER=12D3KooWCNpwHbHmkNSJsqu3CQVVe3iW8g6e1gn3kWTPahj2igiy
```

## Code Structure

The file layout of this repository differs from the koa-api-boilerplate. Instead, it follows the file layout of [Clean Architecture](https://christroutner.github.io/trouts-blog/blog/clean-architecture).

## Usage

- `npm start` Start server on live mode
- `npm run docs` Generate API documentation
- `npm test` Run mocha tests

## Documentation

API documentation is written inline and generated by [apidoc](http://apidocjs.com/). Docs can be generated with this command:
- `npm run docs`

Visit `http://localhost:5020/` to view docs

There is additional developer documentation in the [dev-docs directory](./dev-docs).

## Dependencies

This repository is forked from [ipfs-service-provider](https://github.com/Permissionless-Software-Foundation/ipfs-service-provider).

## IPFS

Snapshots pinned to IPFS will be listed here.

## License

[MIT](./LICENSE.md)
