/*
  Unit tests for the src/lib/users.js business logic library.

  TODO: verify that an admin can change the type of a user
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'
import EventEmitter from 'events'
import cloneDeep from 'lodash.clonedeep'

// Local support libraries
// const testUtils = require('../../utils/test-utils')

// Unit under test (uut)
import BchAdapter from '../../../src/adapters/bch/index.js'
import adapters from '../mocks/adapters/index.js'
import mockDataLib from '../mocks/use-cases/rest-api-mocks.js'

const eventEmitter = new EventEmitter()

describe('#bch-use-case', () => {
  let uut
  let sandbox
  let mockData

  before(async () => {
    // Delete all previous users in the database.
    // await testUtils.deleteAllUsers()
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    mockData = cloneDeep(mockDataLib)

    const ipfs = adapters.ipfs
    uut = new BchAdapter({ ipfs, eventEmitter })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if ipfs is not passed in', () => {
      try {
        uut = new BchAdapter()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of IPFS must be passed when instantiating the BCH Adapter library.'
        )
      }
    })

    // it('should throw an error if adapters are not passed in', () => {
    //   try {
    //     const ipfs = {}
    //     uut = new BchAdapter({ ipfs })
    //
    //     assert.fail('Unexpected code path')
    //   } catch (err) {
    //     assert.include(
    //       err.message,
    //       'An instance of an EventEmitter must be passed when instantiating the adapters.'
    //     )
    //   }
    // })
  })

  describe('#waitForRPCResponse', () => {
    it('should resolve when data is received', async () => {
      // Mock dependencies
      uut.ipfs.ipfsCoordAdapter.bchjs = {
        Util: {
          sleep: () => {}
        }
      }

      // Mock data.
      const rpcId = '123'
      uut.rpcDataQueue.push(mockData.rpcData)

      const result = await uut.waitForRPCResponse(rpcId)
      // console.log('result: ', result)

      assert.property(result, 'success')
      assert.equal(result.success, true)
      assert.property(result, 'balances')
      assert.isArray(result.balances)
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.waitForRPCResponse()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('error: ', err)
        assert.include(err.message, 'rpcId can not be false or undefined')
      }
    })
  })

  describe('#rpcHandler', () => {
    it('should add RPC data to queue', () => {
      const data = {
        payload: {
          id: '123'
        }
      }

      uut.rpcHandler(data)
    })
  })

  describe('#getStatus', () => {
    it('should get the status from ipfs-coord', async () => {
      const result = await uut.getStatus()
      console.log('result: ', result)
    })
  })

  describe('#getBalances', () => {
    it('should get the balance of an address', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const addrs = ['addr1']

      const result = await uut.getBalances(addrs)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut, 'uid').throws(new Error('test error'))

        await uut.getBalances()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'test error')
      }
    })
  })

  describe('#getUtxos', () => {
    it('should get the UTXOs of an address', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const addr = 'addr'

      const result = await uut.getUtxos(addr)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.getUtxos()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'addr required when calling getUtxos')
      }
    })
  })

  describe('#getUtxosBulk', () => {
    it('should get the UTXOs of an address', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const addrs = ['addr']

      const result = await uut.getUtxosBulk(addrs)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should throw an error if addresses is not an array', async () => {
      try {
        await uut.getUtxosBulk()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'addresses parameter must be an array')
      }
    })

    it('should throw an error if addresses array is larger than 20 elements', async () => {
      try {
        const addrs = []
        for (let i = 0; i < 25; i++) {
          addrs.push(i)
        }

        await uut.getUtxosBulk(addrs)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'addresses parameter must not exceed 20 elements')
      }
    })
  })

  describe('#broadcast', () => {
    it('should broadcast a transaction', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const hex = 'abc123'

      const result = await uut.broadcast(hex)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.broadcast()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'hex required when calling broadcast')
      }
    })
  })

  describe('#getTransactions', () => {
    it('should get transactions history for an address', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const addr = 'abc123'

      const result = await uut.getTransactions(addr)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.getTransactions()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'address required when calling getTransactions()')
      }
    })
  })

  describe('#getTransaction', () => {
    it('should get transaction details for a txid', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const txid = 'abc123'

      const result = await uut.getTransaction(txid)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.getTransaction()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'txids required when calling getTransaction()')
      }
    })
  })

  describe('#getPubKey', () => {
    it('should get transaction details for a txid', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const addr = 'abc123'

      const result = await uut.getPubKey(addr)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.getPubKey()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'address required when calling getPubKey()')
      }
    })
  })

  describe('#utxoIsValid', () => {
    it('should validate a utxo', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const utxo = { a: 'b' }

      const result = await uut.utxoIsValid(utxo)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.utxoIsValid()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'utxo required when calling utxoIsValid()')
      }
    })
  })

  describe('#getTokenData', () => {
    it('should validate a utxo', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const tokenId = 'blah'

      const result = await uut.getTokenData(tokenId)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.getTokenData()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'tokenId required when calling getTokenData()')
      }
    })
  })

  describe('#getTokenData2', () => {
    it('should validate a utxo', async () => {
      // Force connection to a wallet service
      uut.ipfs.ipfsCoordAdapter.state = {
        selectedServiceProvider: 'abc123'
      }

      // Mock depenencies
      sandbox.stub(uut, 'waitForRPCResponse').resolves({ key: 'value' })

      const tokenId = 'blah'

      const result = await uut.getTokenData2(tokenId)
      // console.log('result: ', result)

      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.getTokenData2()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'tokenId required when calling getTokenData2()')
      }
    })
  })
})
