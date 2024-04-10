/*
  Clean Architecture Adapter for ipfs-coord.
  This library deals with ipfs-coord library so that the apps business logic
  doesn't need to have any specific knowledge of the library.
*/

// Global npm libraries
// import IpfsCoord from 'ipfs-coord-esm'
import IpfsCoord from 'helia-coord'

// import BCHJS from '@psf/bch-js'
import SlpWallet from 'minimal-slp-wallet'
import semver from 'semver'
import { publicIpv4 } from 'public-ip'

// Local libraries
import config from '../../../config/index.js'

// const JSONRPC = require('../../controllers/json-rpc/')

// The minimum version of ipfs-bch-wallet-service that this wallet can work with.
const MIN_BCH_WALLET_VERSION = '1.11.11'
const WALLET_PROTOCOL = 'bch-wallet'
const MIN_P2WDB_VERSION = '1.4.0'
const P2WDB_PROTOCOL = 'p2wdb'
const MIN_FILE_PIN_VERSION = '1.0.0'
const FILE_PIN_PROTOCOL = 'ipfs-file-pin-service'

let _this

class IpfsCoordAdapter {
  constructor (localConfig = {}) {
    // Dependency injection.
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'Instance of IPFS must be passed when instantiating ipfs-coord.'
      )
    }
    // this.eventEmitter = localConfig.eventEmitter
    // if (!this.eventEmitter) {
    //   throw new Error(
    //     'An instance of an EventEmitter must be passed when instantiating the ipfs-coord adapter.'
    //   )
    // }

    // Encapsulate dependencies
    this.IpfsCoord = IpfsCoord
    this.ipfsCoord = {}
    // this.bchjs = new BCHJS()
    this.wallet = new SlpWallet()
    this.config = config
    this.semver = semver
    this.publicIp = publicIpv4

    // Properties of this class instance.
    this.isReady = false

    // Periodically poll services for available wallet service providers.
    this.pollBchServiceInterval = setInterval(this.pollForBchServices, 10000)
    this.pollIpfsFileServiceInterval = setInterval(
      this.pollForIpfsFileServices,
      11000
    )
    this.pollP2wdbServiceInterval = setInterval(
      this.pollForP2wdbServices,
      12000
    )

    // State object. TODO: Make this more robust.
    this.state = {
      serviceProviders: [],
      selectedServiceProvider: '',
      p2wdbProviders: [],
      selectedP2wdbProvider: '',
      ipfsFileProviders: [],
      selectedIpfsFileProvider: ''
    }

    _this = this
  }

  async start () {
    const circuitRelayInfo = {}

    // Wait for the BCH wallet to create the wallet.
    await this.wallet.walletInfoPromise

    // If configured as a Circuit Relay, get the public IP addresses for this node.
    if (this.config.isCircuitRelay) {
      try {
        const ip4 = await this.publicIp()
        // const ip6 = await publicIp.v6()

        circuitRelayInfo.ip4 = ip4
        circuitRelayInfo.tcpPort = this.config.ipfsTcpPort
        circuitRelayInfo.wsPort = this.config.ipfsWsPort

        // Domain used by browser-based secure websocket connections.
        circuitRelayInfo.crDomain = this.config.crDomain
      } catch (err) {
        /* exit quietly */
      }
    }

    const nullLog = () => {}

    const ipfsCoordOptions = {
      ipfs: this.ipfs,
      type: 'node.js',
      // type: 'browser',
      wallet: this.wallet,
      // privateLog: console.log, // Default to console.log
      privateLog: nullLog,
      isCircuitRelay: this.config.isCircuitRelay,
      circuitRelayInfo,
      apiInfo: this.config.apiInfo,
      announceJsonLd: this.config.announceJsonLd,
      debugLevel: this.config.debugLevel,
      v1Relays: this.config.v1Relays,
      tcpPort: this.config.ipfsTcpPort
    }

    // Production env uses external go-ipfs node.
    // if (this.config.isProduction) {
    //   ipfsCoordOptions.nodeType = 'external'
    // }

    this.ipfsCoord = new this.IpfsCoord(ipfsCoordOptions)

    // Wait for the ipfs-coord library to signal that it is ready.
    await this.ipfsCoord.start()

    // Signal that this adapter is ready.
    this.isReady = true

    return this.isReady
  }

  // Expects router to be a function, which handles the input data from the
  // pubsub channel. It's expected to be capable of routing JSON RPC commands.
  attachRPCRouter (router) {
    try {
      _this.ipfsCoord.privateLog = router
      _this.ipfsCoord.adapters.pubsub.privateLog = router
    } catch (err) {
      console.error('Error in attachRPCRouter()')
      throw err
    }
  }

  // Poll the ipfs-coord coordination channel for available P2WDB service
  // providers. This method is called periodically by a timer-interval.
  pollForP2wdbServices () {
    try {
      // An array of IPFS IDs of other nodes in the coordination pubsub channel.
      const peers = _this.ipfsCoord.thisNode.peerList
      // console.log(`peers: ${JSON.stringify(peers, null, 2)}`)

      // Array of objects. Each object is the IPFS ID of the peer and contains
      // data about that peer.
      const peerData = _this.ipfsCoord.thisNode.peerData
      // console.log(`peerData: ${JSON.stringify(peerData, null, 2)}`)

      for (let i = 0; i < peers.length; i++) {
        const thisPeer = peers[i]
        const thisData = peerData.filter((x) => x.from === thisPeer)
        const thisPeerData = thisData[0]

        // Create a 'fingerprint' that defines the wallet service.
        const protocol = thisPeerData.data.jsonLd.protocol
        const version = thisPeerData.data.jsonLd.version
        // console.log(
        //   `debug: peer ${thisPeer} uses protocol: ${protocol} v${version}`
        // )

        let versionMatches = false
        if (version) {
          versionMatches = _this.semver.gt(version, MIN_P2WDB_VERSION)
        }

        // p2wdbProviders: [],
        // selectedP2wdbProvider: ''

        // Ignore any peers that don't match the fingerprint for a BCH wallet
        // service.
        if (protocol && protocol.includes(P2WDB_PROTOCOL) && versionMatches) {
          // console.log('Matching peer: ', thisPeerData)

          // Temporary business logic.
          // Use the first available wallet service detected.
          if (_this.state.p2wdbProviders.length === 0) {
            _this.state.selectedP2wdbProvider = thisPeer

            // Persist the config setting, so it can be used by other commands.
            // _this.conf.set('selectedService', thisPeer)
            console.log(`---->P2WDB service selected: ${thisPeer}`)
          }

          // If a preferred provider is set in the config file, then connect
          // to the preferred provider when it's discovered.
          if (
            _this.config.preferredP2wdbProvider &&
            thisPeer === _this.config.preferredP2wdbProvider
          ) {
            _this.state.selectedP2wdbProvider = thisPeer
          }

          // Check if the peer has already been added to the list of providers.
          const alreadyExists = _this.state.p2wdbProviders.filter(
            (x) => x === thisPeer
          )

          // Add the peer to the list of serviceProviders if it doesn't already
          // exist in the list.
          if (!alreadyExists.length) {
            _this.state.p2wdbProviders.push(thisPeer)
          }
        }
      }
    } catch (err) {
      // catch and handle known failure mode.
      if (
        err.message.includes("Cannot read property 'peerList' of undefined")
      ) {
        return
      }

      console.error('Error in pollForP2wdbServices()')
      // Do not throw error. This is a top-level function.
    }
  }

  // Poll the ipfs-coord coordination channel for available BCH wallet service
  // providers. This method is called periodically by a timer-interval.
  pollForBchServices () {
    try {
      // console.log('pollForBchServices() polling for BCH service')

      // An array of IPFS IDs of other nodes in the coordination pubsub channel.
      const peers = _this.ipfsCoord.thisNode.peerList
      // console.log(`peers: ${JSON.stringify(peers, null, 2)}`)

      // Array of objects. Each object is the IPFS ID of the peer and contains
      // data about that peer.
      const peerData = _this.ipfsCoord.thisNode.peerData
      // console.log(`peerData: ${JSON.stringify(peerData, null, 2)}`)

      for (let i = 0; i < peers.length; i++) {
        const thisPeer = peers[i]
        const thisData = peerData.filter((x) => x.from === thisPeer)
        const thisPeerData = thisData[0]

        // Create a 'fingerprint' that defines the wallet service.
        const protocol = thisPeerData.data.jsonLd.protocol
        const version = thisPeerData.data.jsonLd.version
        // console.log(
        //   `debug: peer ${thisPeer} uses protocol: ${protocol} v${version}`,
        // )

        let versionMatches = false
        if (version) {
          versionMatches = _this.semver.gt(version, MIN_BCH_WALLET_VERSION)
        }

        // Ignore any peers that don't match the fingerprint for a BCH wallet
        // service.
        if (protocol && protocol.includes(WALLET_PROTOCOL) && versionMatches) {
          // console.log('Matching peer: ', thisPeerData)

          // Temporary business logic.
          // Use the first available wallet service detected.
          if (_this.state.serviceProviders.length === 0) {
            _this.state.selectedServiceProvider = thisPeer

            // Persist the config setting, so it can be used by other commands.
            // _this.conf.set('selectedService', thisPeer)
            console.log(`---->BCH wallet service selected: ${thisPeer}`)
          }

          // console.log('preferredProvider: ', _this.config.preferredProvider)

          // If a preferred provider is set in the config file, then connect
          // to the preferred provider when it's discovered.
          if (
            _this.config.preferredProvider &&
            thisPeer === _this.config.preferredProvider
          ) {
            _this.state.selectedServiceProvider = thisPeer
          }

          // console.log('selectedServiceProvider: ', _this.state.selectedServiceProvider)

          // Check if the peer has already been added to the list of providers.
          const alreadyExists = _this.state.serviceProviders.filter(
            (x) => x === thisPeer
          )

          // Add the peer to the list of serviceProviders if it doesn't already
          // exist in the list.
          if (!alreadyExists.length) {
            _this.state.serviceProviders.push(thisPeer)
          }
        }
      }
    } catch (err) {
      // catch and handle known failure mode.
      if (
        err.message.includes("Cannot read property 'peerList' of undefined")
      ) {
        return
      }

      console.error('Error in pollForBchServices(): ', err)
      // Do not throw error. This is a top-level function.
    }
  }

  // Poll the ipfs-coord coordination channel for available ipfs-file-pin-service
  // providers. This method is called periodically by a timer-interval.
  pollForIpfsFileServices () {
    try {
      // console.log('pollForIpfsFileServices() polling for BCH service')

      // An array of IPFS IDs of other nodes in the coordination pubsub channel.
      const peers = _this.ipfsCoord.thisNode.peerList
      // console.log(`peers: ${JSON.stringify(peers, null, 2)}`)

      // Array of objects. Each object is the IPFS ID of the peer and contains
      // data about that peer.
      const peerData = _this.ipfsCoord.thisNode.peerData
      // console.log(`peerData: ${JSON.stringify(peerData, null, 2)}`)

      for (let i = 0; i < peers.length; i++) {
        const thisPeer = peers[i]
        const thisData = peerData.filter((x) => x.from === thisPeer)
        const thisPeerData = thisData[0]

        // Create a 'fingerprint' that defines the wallet service.
        const protocol = thisPeerData.data.jsonLd.protocol
        const version = thisPeerData.data.jsonLd.version
        // console.log(
        //   `debug: peer ${thisPeer} uses protocol: ${protocol} v${version}`,
        // )

        let versionMatches = false
        if (version) {
          // versionMatches = _this.semver.gt(version, MIN_FILE_PIN_VERSION)
          versionMatches = _this.semver.satisfies(version, `>=${MIN_FILE_PIN_VERSION}`)
        }

        // Ignore any peers that don't match the fingerprint for a BCH wallet
        // service.
        if (protocol && protocol.includes(FILE_PIN_PROTOCOL) && versionMatches) {
          // console.log('Matching peer: ', thisPeerData)

          // Temporary business logic.
          // Use the first available wallet service detected.
          if (_this.state.ipfsFileProviders.length === 0) {
            _this.state.selectedIpfsFileProvider = thisPeer

            // Persist the config setting, so it can be used by other commands.
            // _this.conf.set('selectedService', thisPeer)
            console.log(`---->IPFS File service selected: ${thisPeer}`)
          }

          // console.log('preferredProvider: ', _this.config.preferredProvider)

          // If a preferred provider is set in the config file, then connect
          // to the preferred provider when it's discovered.
          if (
            _this.config.preferredIpfsFileProvider &&
            thisPeer === _this.config.preferredIpfsFileProvider
          ) {
            _this.state.selectedIpfsFileProvider = thisPeer
            console.log(`---->IPFS File service switched to preferred peer: ${thisPeer}`)
          }

          // console.log('selectedServiceProvider: ', _this.state.selectedServiceProvider)

          // Check if the peer has already been added to the list of providers.
          const alreadyExists = _this.state.ipfsFileProviders.filter(
            (x) => x === thisPeer
          )

          // Add the peer to the list of serviceProviders if it doesn't already
          // exist in the list.
          if (!alreadyExists.length) {
            _this.state.ipfsFileProviders.push(thisPeer)
          }
        }
      }
    } catch (err) {
      // catch and handle known failure mode.
      if (
        err.message.includes("Cannot read property 'peerList' of undefined")
      ) {
        return
      }

      console.error('Error in pollForIpfsFileServices(): ', err)
      // Do not throw error. This is a top-level function.
    }
  }

  // This method handles input coming in from other IPFS peers.
  // It passes the data on to the REST API library by emitting an event.
  // peerInputHandler (data) {
  //   try {
  //     // console.log('peerInputHandler triggered with this data: ', data)
  //
  //     this.eventEmitter.emit('rpcData', data)
  //   } catch (err) {
  //     console.error('Error in ipfs-coord.js/peerInputHandler(): ', err)
  //     // Do not throw error. This is a top-level function.
  //   }
  // }

  // Subscribe to the chat pubsub channel
  async subscribeToChat () {
    // TODO: Allow user to replace nullog with their own log handler at startup.
    const nullLog = () => {}

    await this.ipfsCoord.adapters.pubsub.subscribeToPubsubChannel(
      this.config.chatPubSubChan,
      nullLog,
      this.ipfsCoord.thisNode
    )
  }
}

export default IpfsCoordAdapter
