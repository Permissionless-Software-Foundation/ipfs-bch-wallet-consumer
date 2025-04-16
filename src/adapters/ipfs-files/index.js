/*
  This library contains code for interfacing to the ipfs-file-pin-service using
  JSON RPC over IPFS. Most of these functions are called by the /files REST API
  endpoints and the IPFS Use Cases library.
*/

// Public npm libraries
import { v4 as uid } from 'uuid'
import jsonrpc from 'jsonrpc-lite'

// Local libraries
import wlogger from '../wlogger.js'

// let _this

class IpfsFilesAdapter {
  constructor (localConfig = {}) {
    // console.log('BCH localConfig: ', localConfig)
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the IPFS Files Adapter library.'
      )
    }
    // this.eventEmitter = localConfig.eventEmitter
    // if (!this.eventEmitter) {
    //   throw new Error(
    //     'An instance of an EventEmitter must be passed when instantiating the adapters.'
    //   )
    // }

    // Connect the RPC handler when the event fires with new data.
    // this.eventEmitter.on('rpcData', this.rpcHandler)

    // Encapsulate dependencies
    this.uid = uid
    this.jsonrpc = jsonrpc

    // A queue for holding RPC data that has arrived.
    this.rpcDataQueue = []

    // _this = this // Global handle on instance of this Class.

    // Bind 'this' object to all subfunctions for this Class
    this.rpcHandler = this.rpcHandler.bind(this)
    this.getStatus = this.getStatus.bind(this)
    this.selectProvider = this.selectProvider.bind(this)
    this.getFileMetadata = this.getFileMetadata.bind(this)
    this.getPins = this.getPins.bind(this)
    this.waitForRPCResponse = this.waitForRPCResponse.bind(this)
    this.pinClaim = this.pinClaim.bind(this)
  }

  // This handler is triggered when RPC data comes in over IPFS.
  // Handle RPC input, and add the response to the RPC queue.
  // Once in the queue, it will get processed by waitForRPCResponse()
  rpcHandler (data) {
    try {
      // Convert string input into an object.
      // const jsonData = JSON.parse(data)

      // console.log(`JSON RPC response for ID ${data.payload.id} received.`)

      this.rpcDataQueue.push(data)
    } catch (err) {
      console.error('Error in files/rpcHandler(): ', err)
      // Do not throw error. This is a top-level function.
    }
  }

  // Get the status of BCH wallet services this node can talk to. Returns an
  // array of BCH wallet service providers.
  async getStatus () {
    try {
      const peerData = this.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode.peerData
      // console.log(`peerData: ${JSON.stringify(peerData, null, 2)}`)

      // const status = {
      //   state: this.ipfs.ipfsCoordAdapter.state
      // }

      // Add names to the IPFS IDs for each provider.
      const initialServiceProviders =
        this.ipfs.ipfsCoordAdapter.state.ipfsFileProviders
      const serviceProviders = []
      for (let i = 0; i < initialServiceProviders.length; i++) {
        const thisProvider = initialServiceProviders[i]

        const providerData = peerData.filter((x) => x.from === thisProvider)

        if (providerData.length) {
          const provObj = {
            ipfsId: thisProvider,
            name: providerData[0].data.jsonLd.name
          }

          serviceProviders.push(provObj)
        }
      }

      // console.log(
      //   `serviceProviders: ${JSON.stringify(serviceProviders, null, 2)}`
      // )

      const outObj = {
        serviceProviders,
        selectedProvider: this.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider
      }
      // console.log('outObj: ', outObj)

      return outObj
    } catch (err) {
      // console.log('createUser() error: ', err)
      wlogger.error('Error in adapters/files/getStatus()')
      throw err
    }
  }

  // Choose the ipfs-file-pin-service to use.
  async selectProvider (providerId) {
    try {
      this.ipfs.ipfsCoordAdapter.config.selectedIpfsFileProvider = providerId

      return true
    } catch (err) {
      // console.log('createUser() error: ', err)
      wlogger.error('Error in adapters/files/selectProvider()')
      throw err
    }
  }

  // Given a CID, query the ipfs-file-pin-service to get the file metadata, like
  // the file name.
  async getFileMetadata (inObj = {}) {
    try {
      const { cid } = inObj

      // Input validation.
      if (!cid || typeof cid !== 'string') {
        throw new Error('getFileMetadata() cid input hash must be a string.')
      }

      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider
      if (!selectedProvider) {
        throw new Error('No IPFS File Pin Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'getFileMetadata',
        cid
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'file-pin', rpcData)
      const cmdStr = JSON.stringify(cmd)
      // console.log('cmdStr: ', cmdStr)

      // Send the RPC command to selected wallet service.
      const thisNode = this.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode
      await this.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer.sendPrivateMessage(
        selectedProvider,
        cmdStr,
        thisNode
      )

      // Wait for data to come back from the wallet service.
      const data = await this.waitForRPCResponse(rpcId)
      // console.log('getFileMetadata() data: ', data)

      return data
    } catch (err) {
      wlogger.error('Error in adapters/files/getFileMetadata()')
      throw err
    }
  }

  // Get an array of the latest 20 pinned files.
  async getPins (inObj = {}) {
    try {
      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider
      if (!selectedProvider) {
        throw new Error('No IPFS File Pin Service provider available yet.')
      }

      const { page } = inObj

      const rpcData = {
        endpoint: 'getPins',
        page
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'file-pin', rpcData)
      const cmdStr = JSON.stringify(cmd)
      // console.log('cmdStr: ', cmdStr)

      // Send the RPC command to selected wallet service.
      const thisNode = this.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode
      await this.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer.sendPrivateMessage(
        selectedProvider,
        cmdStr,
        thisNode
      )

      // Wait for data to come back from the wallet service.
      const data = await this.waitForRPCResponse(rpcId)
      // console.log('getFileMetadata() data: ', data)

      return data
    } catch (err) {
      wlogger.error('Error in adapters/files/getPins()')
      throw err
    }
  }

  // Returns a promise that resolves to data when the RPC response is recieved.
  async waitForRPCResponse (rpcId) {
    try {
      // Initialize variables for tracking the return data.
      let dataFound = false
      let cnt = 0

      // Default return value, if the remote computer does not respond in time.
      let data = {
        success: false,
        message: 'request timed out',
        data: ''
      }

      // Loop that waits for a response from the service provider.
      do {
        // console.log(`this.rpcDataQueue.length: ${this.rpcDataQueue.length}`)
        for (let i = 0; i < this.rpcDataQueue.length; i++) {
          const rawData = this.rpcDataQueue[i]
          // console.log(`rawData: ${JSON.stringify(rawData, null, 2)}`)

          if (rawData.payload.id === rpcId) {
            dataFound = true
            // console.log('data was found in the queue')

            data = rawData.payload.result.value

            // Remove the data from the queue
            this.rpcDataQueue.splice(i, 1)

            break
          }
        }

        // Wait between loops.
        // await this.sleep(1000)
        await this.ipfs.ipfsCoordAdapter.wallet.bchjs.Util.sleep(2000)

        cnt++

        // Exit if data was returned, or the window for a response expires.
      } while (!dataFound && cnt < 10)
      // console.log(`dataFound: ${dataFound}, cnt: ${cnt}`)

      return data
    } catch (err) {
      console.error('Error in waitForRPCResponse()')
      throw err
    }
  }

  async pinClaim (inObj = {}) {
    try {
      // Throw an error if this IPFS node has not yet made a connection to a
      // ipfs service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider
      if (!selectedProvider) {
        throw new Error('No IPFS File Provider Service is available yet. Try again in a few seconds.')
      }

      const { proofOfBurnTxid, cid, claimTxid, filename, address } = inObj

      const rpcData = {
        endpoint: 'pinClaim',
        proofOfBurnTxid,
        cid,
        claimTxid,
        filename,
        address
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'file-pin', rpcData)
      const cmdStr = JSON.stringify(cmd)
      // console.log('cmdStr: ', cmdStr)

      // Send the RPC command to selected wallet service.
      const thisNode = this.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode
      await this.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer.sendPrivateMessage(
        selectedProvider,
        cmdStr,
        thisNode
      )

      // Wait for data to come back from the wallet service.
      const data = await this.waitForRPCResponse(rpcId)

      return data
    } catch (err) {
      console.error('Error in pinClaim()')
      throw err
    }
  }
}

// module.exports = P2wdbAdapter
export default IpfsFilesAdapter
