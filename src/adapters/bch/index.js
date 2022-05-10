/*
  This library contains business-logic for dealing with BCH wallet service
  providers. Most of these functions are called by the /bch REST API endpoints.
*/

// Public npm libraries
const { v4: uid } = require('uuid')
const jsonrpc = require('jsonrpc-lite')

// Local libraries
const { wlogger } = require('../wlogger')

let _this

class BchAdapter {
  constructor (localConfig = {}) {
    // console.log('BCH localConfig: ', localConfig)
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the BCH Adapter library.'
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
      console.error('Error in rest-api.js/rpcHandler(): ', err)
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
        this.ipfs.ipfsCoordAdapter.state.serviceProviders
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
          this.ipfs.ipfsCoordAdapter.state.selectedServiceProvider
      }
      // console.log('outObj: ', outObj)

      return outObj
    } catch (err) {
      // console.log('createUser() error: ', err)
      wlogger.error('Error in use-cases/bch.js/getStatus()')
      throw err
    }
  }

  // Choose the BCH wallet service to use.
  async selectProvider (providerId) {
    try {
      this.ipfs.ipfsCoordAdapter.config.preferredProvider = providerId

      return true
    } catch (err) {
      // console.log('createUser() error: ', err)
      wlogger.error('Error in use-cases/bch.js/getStatus()')
      throw err
    }
  }

  // Get the BCH balance for an array of addresses.
  async getBalances (addrs) {
    try {
      // console.log('addrs: ', addrs)

      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedServiceProvider
      if (!selectedProvider) {
        throw new Error('No BCH Wallet Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'balance',
        addresses: addrs
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'bch', rpcData)
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
      // console.log('createUser() error: ', err)
      wlogger.error('Error in use-cases/bch.js/getBalances()')
      throw err
    }
  }

  async getUtxos (addr) {
    try {
      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedServiceProvider
      if (!selectedProvider) {
        throw new Error('No BCH Wallet Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'utxos',
        address: addr
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'bch', rpcData)
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
      // console.log(`data: ${JSON.stringify(data, null, 2)}`)

      return data
    } catch (err) {
      // console.log('createUser() error: ', err)
      wlogger.error('Error in use-cases/bch.js/getUtxos()')
      throw err
    }
  }

  async broadcast (hex) {
    try {
      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedServiceProvider
      if (!selectedProvider) {
        throw new Error('No BCH Wallet Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'broadcast',
        hex
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'bch', rpcData)
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
      // console.log('createUser() error: ', err)
      wlogger.error('Error in adapters/bch.js/broadcast()')
      throw err
    }
  }

  // Get the transaction history for an address.
  async getTransactions (address, sortOrder = 'DESCENDING', page = 0) {
    try {
      console.log('Executing getTransaction() bch adapter')

      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedServiceProvider
      if (!selectedProvider) {
        throw new Error('No BCH Wallet Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'txHistory',
        address: address,
        sortOrder,
        page
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'bch', rpcData)
      const cmdStr = JSON.stringify(cmd)
      console.log('cmdStr: ', cmdStr)

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
      // console.log('createUser() error: ', err)
      wlogger.error('Error in adapters/bch.js/transactions()')
      throw err
    }
  }

  // Get details on an array of TXIDs.
  async getTransaction (txids) {
    try {
      console.log(
        `Getting txData on these txids: ${JSON.stringify(txids, null, 2)}`
      )

      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedServiceProvider
      if (!selectedProvider) {
        throw new Error('No BCH Wallet Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'txData',
        txids
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'bch', rpcData)
      const cmdStr = JSON.stringify(cmd)
      console.log('cmdStr: ', cmdStr)

      // Send the RPC command to selected wallet service.
      const thisNode = this.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode
      await this.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer.sendPrivateMessage(
        selectedProvider,
        cmdStr,
        thisNode
      )

      // Wait for data to come back from the wallet service.
      const data = await this.waitForRPCResponse(rpcId)
      console.log(`data: ${JSON.stringify(data, null, 2)}`)

      return data
    } catch (err) {
      // console.log('createUser() error: ', err)
      wlogger.error('Error in adapters/bch.js/getTransaction()')
      throw err
    }
  }

  async getPubKey (address) {
    try {
      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedServiceProvider
      if (!selectedProvider) {
        throw new Error('No BCH Wallet Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'pubkey',
        address
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'bch', rpcData)
      const cmdStr = JSON.stringify(cmd)
      console.log('cmdStr: ', cmdStr)

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
      console.log('getPubKey() error: ', err)
      wlogger.error('Error in adapters/bch.js/getPubKey()')
      throw err
    }
  }

  async utxoIsValid (utxo) {
    try {
      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedServiceProvider
      if (!selectedProvider) {
        throw new Error('No BCH Wallet Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'utxoIsValid',
        utxo
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'bch', rpcData)
      const cmdStr = JSON.stringify(cmd)
      console.log('cmdStr: ', cmdStr)

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
      console.log('utxoIsValid() error: ', err)
      wlogger.error('Error in adapters/bch.js/utxoIsValid()')
      throw err
    }
  }

  async getTokenData (tokenId) {
    try {
      // Throw an error if this IPFS node has not yet made a connection to a
      // wallet service provider.
      const selectedProvider =
        this.ipfs.ipfsCoordAdapter.state.selectedServiceProvider
      if (!selectedProvider) {
        throw new Error('No BCH Wallet Service provider available yet.')
      }

      const rpcData = {
        endpoint: 'getTokenData',
        tokenId
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'bch', rpcData)
      const cmdStr = JSON.stringify(cmd)
      console.log('cmdStr: ', cmdStr)

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
      console.log('getTokenData() error: ', err)
      wlogger.error('Error in adapters/bch.js/getTokenData()')
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

            // console.log(
            //   `rawData.payload: ${JSON.stringify(rawData.payload, null, 2)}`
            // )
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

module.exports = BchAdapter
