/*
  Unit tests for the IPFS Files Adapter.
*/

import { assert } from 'chai'
import sinon from 'sinon'
import cloneDeep from 'lodash.clonedeep'
import adapters from '../mocks/adapters/index.js'
import IPFSFilesAdapter from '../../../src/adapters/ipfs-files/index.js'
// import IPFSMock from '../mocks/ipfs-mock.js'

import mockDataLib from '../mocks/adapters/ipfs-coord-mocks.js'
import mockDataRPC from '../mocks/use-cases/rest-api-mocks.js'

describe('#IPFS-Files', () => {
  let uut
  let sandbox
  let mockData

  beforeEach(() => {
    const ipfs = adapters.ipfs
    uut = new IPFSFilesAdapter({ ipfs })

    sandbox = sinon.createSandbox()

    mockData = cloneDeep(mockDataLib)
  })

  afterEach(() => {
    sandbox.restore()

    clearInterval(uut.pollBchServiceInterval)
    clearInterval(uut.pollP2wdbServiceInterval)
  })

  describe('#constructor', () => {
    it('should throw an error if ipfs instance is not included', () => {
      try {
        uut = new IPFSFilesAdapter()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of IPFS must be passed when instantiating the IPFS Files Adapter library.'
        )
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
    it('should skip errors', async () => {
      try {
        sandbox.stub(uut.rpcDataQueue, 'push').throws(new Error('test error'))
        await uut.rpcHandler()
      } catch (err) {
        assert.fail('Unexpected code path')
      }
    })
  })
  describe('#getStatus', () => {
    it('should get the status from ipfs-coord', async () => {
      uut.ipfs.ipfsCoordAdapter.state.ipfsFileProviders = mockData.peers
      uut.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode = { peerData: mockData.peerData }

      await uut.getStatus()
    })
    it('should handle error', async () => {
      try {
        uut.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode = null
        await uut.getStatus()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })
  describe('#selectProvider', () => {
    it('should select provider', async () => {
      await uut.selectProvider('providerId to select')
      assert.equal(uut.ipfs.ipfsCoordAdapter.config.selectedIpfsFileProvider, 'providerId to select')
    })
    it('should handle error', async () => {
      try {
        await uut.selectProvider()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'providerId must be a string!')
      }
    })
  })
  describe('#getFileMetadata', () => {
    it('should get file metadata', async () => {
      uut.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider = mockData.peers[0]
      sandbox.stub(uut, 'waitForRPCResponse').resolves({
        success: true
      })
      const result = await uut.getFileMetadata({ cid: 'cid to get' })
      assert.equal(result.success, true)
    })
    it('should handle error if no cid is provided', async () => {
      try {
        await uut.getFileMetadata()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'getFileMetadata() cid input hash must be a string.')
      }
    })
    it('should handle error if no provider is selected', async () => {
      try {
        uut.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider = null
        await uut.getFileMetadata({ cid: 'cid to get' })
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'No IPFS File Pin Service provider available yet.')
      }
    })
  })
  describe('#getPins', () => {
    it('should get pins', async () => {
      uut.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider = mockData.peers[0]
      sandbox.stub(uut, 'waitForRPCResponse').resolves({
        success: true
      })
      const result = await uut.getPins()
      assert.equal(result.success, true)
    })
    it('should handle error if no provider is selected', async () => {
      try {
        uut.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider = null
        await uut.getPins()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'No IPFS File Pin Service provider available yet.')
      }
    })
  })
  describe('#waitForRPCResponse', () => {
    it('should resolve when data is received', async () => {
      // Mock dependencies
      uut.ipfs.ipfsCoordAdapter.wallet = {
        bchjs: {
          Util: {
            sleep: () => {}
          }
        }
      }

      // Mock data.
      const rpcId = '123'
      uut.rpcDataQueue.push(mockDataRPC.rpcData)

      const result = await uut.waitForRPCResponse(rpcId)
      // console.log('result: ', result)

      assert.property(result, 'success')
      assert.equal(result.success, true)
      assert.property(result, 'balances')
      assert.isArray(result.balances)
    })
    it('should return false if data is not found', async () => {
      // Mock dependencies
      uut.ipfs.ipfsCoordAdapter.wallet = {
        bchjs: {
          Util: {
            sleep: () => {}
          }
        }
      }

      // Mock data.
      const rpcId = '123'
      // Fill the queue with false values.
      for (let i = 0; i < 10; i++) {
        uut.rpcDataQueue.push({ payload: { id: '1234567890' } })
      }
      sandbox.stub(uut.ipfs.ipfsCoordAdapter.bchjs.Util, 'sleep').resolves()

      const result = await uut.waitForRPCResponse(rpcId)
      // console.log('result: ', result)

      assert.property(result, 'success')
      assert.isFalse(result.success)
    })
    it('should catch and throw an error', async () => {
      try {
        uut.ipfs.ipfsCoordAdapter.wallet = {
          bchjs: {
            Util: {
              sleep: () => {}
            }
          }
        }

        await uut.waitForRPCResponse()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('error: ', err)
        assert.include(err.message, 'rpcId can not be false or undefined')
      }
    })
  })
  describe('#pinClaim', () => {
    it('should process pinClaim', async () => {
      uut.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider = mockData.peers[0]
      sandbox.stub(uut, 'waitForRPCResponse').resolves({
        success: true
      })
      const result = await uut.pinClaim({
        proofOfBurnTxid: 'proofOfBurnTxid to pin',
        cid: 'cid to pin',
        claimTxid: 'claimTxid to pin',
        filename: 'filename to pin',
        address: 'address to pin'
      })
      assert.equal(result.success, true)
    })
    it('should handle error if no provider is selected', async () => {
      try {
        uut.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider = null
        await uut.pinClaim({
          proofOfBurnTxid: 'proofOfBurnTxid to pin',
          cid: 'cid to pin',
          claimTxid: 'claimTxid to pin',
          filename: 'filename to pin',
          address: 'address to pin'
        })
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'No IPFS File Provider Service is available yet. Try again in a few seconds.')
      }
    })
  })
})
