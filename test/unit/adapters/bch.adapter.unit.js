/*
  Unit tests for the src/lib/users.js business logic library.

  TODO: verify that an admin can change the type of a user
*/

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const EventEmitter = require('events')
const cloneDeep = require('lodash.clonedeep')

// Local support libraries
// const testUtils = require('../../utils/test-utils')

// Unit under test (uut)
const BchAdapter = require('../../../src/adapters/bch')
const adapters = require('../mocks/adapters')
const eventEmitter = new EventEmitter()
const mockDataLib = require('../mocks/use-cases/rest-api-mocks')

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

    it('should throw an error if adapters are not passed in', () => {
      try {
        const ipfs = {}
        uut = new BchAdapter({ ipfs })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of an EventEmitter must be passed when instantiating the adapters.'
        )
      }
    })
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
        // Force an error
        uut.ipfs.ipfsCoordAdapter.bchjs = {
          Util: {
            sleep: () => {
              throw new Error('test error')
            }
          }
        }

        // Mock data.
        const rpcId = '123'
        uut.rpcDataQueue.push(mockData.rpcData)

        await uut.waitForRPCResponse(rpcId)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('error: ', err)
        assert.include(err.message, 'test error')
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
        await uut.getBalances()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.equal(err.message, 'test error')
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
        assert.equal(err.message, 'test error')
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
        assert.equal(err.message, 'test error')
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
        assert.equal(err.message, 'test error')
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
        assert.equal(err.message, 'test error')
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
        assert.equal(err.message, 'test error')
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
        assert.equal(err.message, 'test error')
      }
    })
  })
})
