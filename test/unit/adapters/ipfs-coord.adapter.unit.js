/*
  Unit tests for the IPFS Adapter.
*/

const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

const IPFSCoordAdapter = require('../../../src/adapters/ipfs/ipfs-coord')
const IPFSMock = require('../mocks/ipfs-mock')
const IPFSCoordMock = require('../mocks/ipfs-coord-mock')
const config = require('../../../config')
const mockDataLib = require('../mocks/adapters/ipfs-coord-mocks')

describe('#IPFS', () => {
  let uut
  let sandbox
  let mockData

  beforeEach(() => {
    const ipfs = IPFSMock.create()
    uut = new IPFSCoordAdapter({ ipfs })

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
        uut = new IPFSCoordAdapter()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of IPFS must be passed when instantiating ipfs-coord.'
        )
      }
    })

    // it('should throw an error if EventEmitter instance is not included', () => {
    //   try {
    //     const ipfs = IPFSMock.create()
    //     uut = new IPFSCoordAdapter({ ipfs })
    //
    //     assert.fail('Unexpected code path')
    //   } catch (err) {
    //     assert.include(
    //       err.message,
    //       'An instance of an EventEmitter must be passed when instantiating the ipfs-coord adapter.'
    //     )
    //   }
    // })
  })

  describe('#start', () => {
    it('should return a promise that resolves into an instance of IPFS.', async () => {
      // Mock dependencies.
      uut.IpfsCoord = IPFSCoordMock

      const result = await uut.start()
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should get the public IP address if this node is a Circuit Relay', async () => {
      // Mock dependencies.
      uut.IpfsCoord = IPFSCoordMock
      sandbox.stub(uut.publicIp, 'v4').returns('123')

      // Force Circuit Relay
      uut.config.isCircuitRelay = true

      const result = await uut.start()
      // console.log('result: ', result)

      assert.equal(result, true)
    })
    it('should return a promise that resolves into an instance of IPFS in production mode', async () => {
      uut.config.isProduction = true
      // Mock dependencies.
      uut.IpfsCoord = IPFSCoordMock

      const result = await uut.start()
      // console.log('result: ', result)
      assert.equal(result, true)
      config.isProduction = false
    })
  })

  describe('#attachRPCRouter', () => {
    it('should attached a router output', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        privateLog: {},
        ipfs: {
          orbitdb: {
            privateLog: {}
          }
        },
        adapters: {
          pubsub: {
            privateLog: () => {
            }
          }
        }
      }

      const router = console.log

      uut.attachRPCRouter(router)
    })

    it('should catch and throw an error', () => {
      try {
        // Force an error
        delete uut.ipfsCoord.adapters

        const router = console.log

        uut.attachRPCRouter(router)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#pollForBchServices', () => {
    it('should find and select the wallet service', () => {
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }

      uut.pollForBchServices()

      // It should fine the service in the mocked data.
      assert.equal(
        uut.state.selectedServiceProvider,
        'QmWkjYRRTaxVEuGK8ip2X3trVyJShFs6U9g1h9x6fK5mZ2'
      )
    })

    it('should catch and report errors', () => {
      uut.pollForBchServices()

      assert.isOk(true, 'Not throwing an error is a success.')
    })
  })

  // describe('#peerInputHandler', () => {
  //   it('should emit an event trigger', () => {
  //     const data = 'some data'
  //
  //     uut.peerInputHandler(data)
  //
  //     assert.isOk(true, 'Not throwing an error is a success')
  //   })
  //
  //   it('should catch and report errors', () => {
  //     // Force an error
  //     sandbox.stub(uut.eventEmitter, 'emit').throws(new Error('test error'))
  //
  //     uut.peerInputHandler()
  //
  //     assert.isOk(true, 'Not throwing an error is a success.')
  //   })
  // })

  describe('#subscribeToChat', () => {
    it('should subscribe to the chat channel', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        adapters: {
          pubsub: {
            subscribeToPubsubChannel: async () => {
            }
          }
        }
      }

      await uut.subscribeToChat()
    })
  })
})
