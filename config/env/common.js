/*
  This file is used to store unsecure, application-specific data common to all
  environments.

  Additional Environent Variables:
  - CONNECT_PREF: should have a value of 'cr' (default), or 'direct'. This is
    used by helia-coord to select a connection preference between peers. Servers
    with an ip4 or ip6 address should use 'direct'.
*/

/* eslint  no-unneeded-ternary:0 */

// Hack to get __dirname back.
// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
import * as url from 'url'

// Get the version from the package.json file.
import { readFileSync } from 'fs'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const pkgInfo = JSON.parse(readFileSync(`${__dirname.toString()}/../../package.json`))

const version = pkgInfo.version

const ipfsCoordName = process.env.COORD_NAME
  ? process.env.COORD_NAME
  : 'ipfs-bch-wallet-service'

export default {
  // Configure TCP port.
  port: process.env.PORT || 5005,

  // Password for HTML UI that displays logs.
  logPass: 'test',

  // Email server settings if nodemailer email notifications are used.
  emailServer: process.env.EMAILSERVER
    ? process.env.EMAILSERVER
    : 'mail.someserver.com',
  emailUser: process.env.EMAILUSER
    ? process.env.EMAILUSER
    : 'noreply@someserver.com',
  emailPassword: process.env.EMAILPASS
    ? process.env.EMAILPASS
    : 'emailpassword',

  // FullStack.cash account information, used for automatic JWT handling.
  getJwtAtStartup: process.env.GET_JWT_AT_STARTUP ? true : false,
  authServer: process.env.AUTHSERVER
    ? process.env.AUTHSERVER
    : 'https://auth.fullstack.cash',
  apiServer: process.env.APISERVER
    ? process.env.APISERVER
    : 'https://api.fullstack.cash/v5/',
  fullstackLogin: process.env.FULLSTACKLOGIN
    ? process.env.FULLSTACKLOGIN
    : 'demo@demo.com',
  fullstackPassword: process.env.FULLSTACKPASS
    ? process.env.FULLSTACKPASS
    : 'demo',

  // IPFS settings.
  useIpfs: process.env.DISABLE_IPFS ? false : true, // Disable IPFS flag
  isCircuitRelay: process.env.ENABLE_CIRCUIT_RELAY ? true : false,
  // SSL domain used for websocket connection via browsers.
  crDomain: process.env.CR_DOMAIN ? process.env.CR_DOMAIN : '',

  // Information passed to other IPFS peers about this node.
  apiInfo: 'https://ipfs-service-provider.fullstack.cash/',

  // JSON-LD and Schema.org schema with info about this app.
  announceJsonLd: {
    '@context': 'https://schema.org/',
    '@type': 'WebAPI',
    name: ipfsCoordName,
    version,
    protocol: 'generic-service',
    description:
      'This is a generic IPFS Serivice Provider that uses JSON RPC over IPFS to communicate with it. This instance has not been customized. Source code: https://github.com/Permissionless-Software-Foundation/ipfs-service-provider',
    documentation: 'https://ipfs-service-provider.fullstack.cash/',
    provider: {
      '@type': 'Organization',
      name: 'Permissionless Software Foundation',
      url: 'https://PSFoundation.cash'
    }
  },

  // IPFS Ports
  ipfsTcpPort: process.env.IPFS_TCP_PORT ? process.env.IPFS_TCP_PORT : 4101,
  ipfsWsPort: process.env.IPFS_WS_PORT ? process.env.IPFS_WS_PORT : 4103,

  // BCH Mnemonic for generating encryption keys and payment address
  mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : '',

  debugLevel: process.env.DEBUG_LEVEL ? parseInt(process.env.DEBUG_LEVEL) : 2,

  // Preferred provider running ipfs-bch-wallet-service for BCH wallet.
  preferredProvider: process.env.PREFERRED_PROVIDER
    ? process.env.PREFERRED_PROVIDER
    : '',
  // If true, users will not be able to change the provider via a REST API call.
  freezeProvider: process.env.FREEZE_PROVIDER ? true : false,
  //  : 'QmdBGB8S6sEr19gaAxJYjhRbz5ZmMiH5a1JyyMmaxcRKnY'
  // : 'QmUTx6KqYKVZbKpKxR7vGDUgZFYVvVVyEWDeCYq4GwBCff'
  // Used for development

  // Preferred P2WDB provider
  preferredP2wdbProvider: process.env.PREFERRED_P2WDB_PROVIDER
    ? process.env.PREFERRED_P2WDB_PROVIDER
    : '',

  // Settings for production, using external go-ipfs node.
  isProduction: process.env.SVC_ENV === 'prod' ? true : false,
  ipfsHost: process.env.IPFS_HOST ? process.env.IPFS_HOST : 'localhost',
  ipfsApiPort: process.env.IPFS_API_PORT
    ? parseInt(process.env.IPFS_API_PORT)
    : 5001,

  chatPubSubChan: 'psf-ipfs-chat-001',

  // This can add specific Circuit Relay v2 servers to connect to.
  bootstrapRelays: [
    // v2 Circuit Relay (Token Tiger)
    // '/ip4/137.184.93.145/tcp/8001/p2p/12D3KooWGMEKkdJfyZbwdH9EafZbRTtMn7FnhWPrE4MhRty2763g',

    // v2 Circuit Relay server (FullStack.cash)
    // '/ip4/78.46.129.7/tcp/4001/p2p/12D3KooWFQ11GQ5NubsJGhYZ4X3wrAGimLevxfm6HPExCrMYhpSL'
  ]
}
