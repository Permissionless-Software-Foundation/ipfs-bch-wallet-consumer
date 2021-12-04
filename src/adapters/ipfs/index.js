/*
  top-level IPFS library that combines the individual IPFS-based libraries.
*/

const IpfsAdapter = require('./ipfs')
const IpfsCoordAdapter = require('./ipfs-coord')

class IPFS {
  constructor (localConfig = {}) {
    // Dependency injection.
    this.eventEmitter = localConfig.eventEmitter
    if (!this.eventEmitter) {
      throw new Error(
        'An instance of an EventEmitter must be passed when instantiating the ipfs-coord adapter.'
      )
    }

    // Encapsulate dependencies
    this.ipfsAdapter = new IpfsAdapter()
    this.IpfsCoordAdapter = IpfsCoordAdapter
    this.process = process

    this.ipfsCoordAdapter = {} // placeholder

    // Properties of this class instance.
    this.isReady = false
  }

  // Provides a global start() function that triggers the start() function in
  // the underlying libraries.
  async start () {
    try {
      // Start IPFS
      await this.ipfsAdapter.start()
      console.log('IPFS is ready.')

      // this.ipfs is a Promise that will resolve into an instance of an IPFS node.
      this.ipfs = this.ipfsAdapter.ipfs

      // Start ipfs-coord
      this.ipfsCoordAdapter = new this.IpfsCoordAdapter({
        ipfs: this.ipfs,
        eventEmitter: this.eventEmitter
      })
      await this.ipfsCoordAdapter.start()
      console.log('ipfs-coord is ready.')

      return true
    } catch (err) {
      console.error('Error in adapters/ipfs/index.js/start()')

      // If error is due to a lock file issue. Kill the process, so that
      // Docker or pm2 has a chance to restart the service.
      if (err.message.includes('Lock already being held')) {
        this.process.exit(1)
      }

      throw err
    }
  }

  // Get the status of this IPFS node.
  getStatus () {
    try {
      // console.log(
      //   'this.ipfsCoordAdapter.ipfsCoord.thisNode: ',
      //   this.ipfsCoordAdapter.ipfsCoord.thisNode
      // )

      const statusObj = {
        ipfsId: this.ipfsCoordAdapter.ipfsCoord.thisNode.ipfsId,
        multiAddrs: this.ipfsCoordAdapter.ipfsCoord.thisNode.ipfsMultiaddrs,
        bchAddr: this.ipfsCoordAdapter.ipfsCoord.thisNode.bchAddr,
        slpAddr: this.ipfsCoordAdapter.ipfsCoord.thisNode.slpAddr,
        pubKey: this.ipfsCoordAdapter.ipfsCoord.thisNode.pubKey,
        peers: this.ipfsCoordAdapter.ipfsCoord.thisNode.peerList.length,
        relays: this.ipfsCoordAdapter.ipfsCoord.thisNode.relayData.length
      }

      return statusObj
    } catch (err) {
      console.error('Error in ipfs-coord.js/getStatus()')
      throw err
    }
  }
}

module.exports = IPFS