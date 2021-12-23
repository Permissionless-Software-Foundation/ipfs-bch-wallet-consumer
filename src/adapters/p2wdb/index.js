/*
  This library contains business-logic for dealing with P2WDB service
  providers. Most of these functions are called by the /p2wdb REST API endpoints.
*/

// Public npm libraries
const { v4: uid } = require('uuid')
const jsonrpc = require('jsonrpc-lite')

// Local libraries
const { wlogger } = require('../wlogger')

let _this

class P2wdbAdapter {
  constructor (localConfig = {}) {
    // console.log('BCH localConfig: ', localConfig)
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the P2WDB Adapter library.'
      )
    }
    this.eventEmitter = localConfig.eventEmitter
    if (!this.eventEmitter) {
      throw new Error(
        'An instance of an EventEmitter must be passed when instantiating the adapters.'
      )
    }

    // Connect the RPC handler when the event fires with new data.
    this.eventEmitter.on('rpcData', this.rpcHandler)

    // Encapsulate dependencies
    this.uid = uid
    this.jsonrpc = jsonrpc

    // A queue for holding RPC data that has arrived.
    this.rpcDataQueue = []

    _this = this // Global handle on instance of this Class.
  }

  // This handler is triggered when RPC data comes in over IPFS.
  // Handle RPC input, and add the response to the RPC queue.
  // Once in the queue, it will get processed by waitForRPCResponse()
  rpcHandler (data) {
    try {
      // Convert string input into an object.
      // const jsonData = JSON.parse(data)

      console.log(`JSON RPC response for ID ${data.payload.id} received.`)

      _this.rpcDataQueue.push(data)
    } catch (err) {
      console.error('Error in p2wdb/rpcHandler(): ', err)
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
        this.ipfs.ipfsCoordAdapter.state.p2wdbProviders
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
        selectedProvider:
          this.ipfs.ipfsCoordAdapter.state.selectedP2wdbProvider
      }
      // console.log('outObj: ', outObj)

      return outObj
    } catch (err) {
      // console.log('createUser() error: ', err)
      wlogger.error('Error in adapters/p2wdb.js/getStatus()')
      throw err
    }
  }

  // Choose the BCH wallet service to use.
  async selectProvider (providerId) {
    try {
      this.ipfs.ipfsCoordAdapter.config.preferredP2wdbProvider = providerId

      return true
    } catch (err) {
      // console.log('createUser() error: ', err)
      wlogger.error('Error in adapters/p2wdb/getStatus()')
      throw err
    }
  }

  // Read an entry from the P2WDB, given an entry hash.
  async getEntryByHash (hash) {
    try {
      // Input validation.
      if (!hash || typeof hash !== 'string') {
        throw new Error('getEntry() input hash must be a string.')
      }

      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedP2wdbProvider
      if (!selectedProvider) {
        throw new Error('No P2WDB Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'getByHash',
        hash
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'p2wdb', rpcData)
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
      console.error('Error in getEntryByHash()')
      throw err
    }
  }

  async writeEntry (writeObj) {
    try {
      const { txid, signature, message, data } = writeObj

      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedP2wdbProvider
      if (!selectedProvider) {
        throw new Error('No P2WDB Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'write',
        txid,
        signature,
        message,
        data
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'p2wdb', rpcData)
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
      const result = await this.waitForRPCResponse(rpcId)

      return result
    } catch (err) {
      console.error('Error in adapters/p2wdb/writeEntry()')
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
        await this.ipfs.ipfsCoordAdapter.bchjs.Util.sleep(2000)

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
}

module.exports = P2wdbAdapter
