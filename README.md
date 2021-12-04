# ipfs-bch-wallet-consumer

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

This is a REST API server based on [Koa](https://koajs.com/). It's essentially a mirror image of [ipfs-bch-wallet-service](https://github.com/Permissionless-Software-Foundation/ipfs-bch-wallet-service). Where ipfs-bch-wallet-service is intended to be coupled to [bch-api](https://github.com/Permissionless-Software-Foundation/bch-api) to _provide_ blockchain service, ipfs-bch-wallet-consumer provides a localized REST API for _consuming_ that blockchain service.

When started, this web server starts an [IPFS](https://ipfs.io) node and connects to an ipfs-bch-wallet-service server over the IPFS network. It then pipes that connection over its own localized REST API.

## Requirements

- node **^14.17.0**
- npm **^7.13.0**

## Installation

### Development Environment

A development environment will allow you modify the code on-the-fly and contribute to the code base of this repository. [PM2](https://www.npmjs.com/package/pm2) is recommended for running this code base as an IPFS Circuit Relay.

- [Video: Installing ipfs-service-provider](https://youtu.be/Z0NsboIVN44)
- [Step-by-step installation instructions](https://gist.github.com/christroutner/3304a71d4c12a3a3e1664a438f64d9d0)

```bash
git clone https://github.com/Permissionless-Software-Foundation/ipfs-service-provider
cd ipfs-service-provider
./install-mongo-sh
sudo npm install -g node-pre-gyp
npm install
./ipfs-service-provider.sh
```

### Production Environment

The [docker](./production/docker) directory contains a Dockerfile for building a production deployment. However, there is currently [a bug](https://github.com/Permissionless-Software-Foundation/ipfs-service-provider/issues/38) preventing the Docker container from being used as a Circuit Relay.

```
docker-compose build --no-cache
docker-compose up -d
```

### Operation Notes

- There is a memory leak in the version of js-ipfs. The app is currently configured to shut down every 8 hours to flush memory. It relies on a process manager like pm2, Docker, or systemd to restart the app after it shuts down, in order to ensure continuous operation.

## Structure

The file layout of this repository differs from the koa-api-boilerplate. Instead, it follows the file layout of [Clean Architecture](troutsblog.com/blog/clean-architecture).

## Usage

- `npm start` Start server on live mode
- `npm run docs` Generate API documentation
- `npm test` Run mocha tests
- `docker-compose build` Build a 'production' Docker container
- `docker-compose up` Run the docker container

## Documentation

API documentation is written inline and generated by [apidoc](http://apidocjs.com/).

Visit `http://localhost:5000/docs/` to view docs

## Dependencies

- [koa2](https://github.com/koajs/koa/tree/v2.x)
- [koa-router](https://github.com/alexmingoia/koa-router)
- [koa-bodyparser](https://github.com/koajs/bodyparser)
- [koa-generic-session](https://github.com/koajs/generic-session)
- [koa-logger](https://github.com/koajs/logger)
- [MongoDB](http://mongodb.org/)
- [Mongoose](http://mongoosejs.com/)
- [Passport](http://passportjs.org/)
- [Nodemon](http://nodemon.io/)
- [Mocha](https://mochajs.org/)
- [apidoc](http://apidocjs.com/)
- [ESLint](http://eslint.org/)
- [ipfs-coord](https://www.npmjs.com/package/ipfs-coord)

## IPFS

Snapshots pinned to IPFS will be listed here.

## License

[MIT](./LICENSE.md)

test