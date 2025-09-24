/*
  Unit tests for the IPFS Adapter.
*/

import { assert } from 'chai'
import sinon from 'sinon'
import cloneDeep from 'lodash.clonedeep'
import IPFSCoordAdapter from '../../../src/adapters/ipfs/ipfs-coord.js'
// import IPFSMock from '../mocks/ipfs-mock.js'
import create from '../mocks/ipfs-mock.js'
import IPFSCoordMock from '../mocks/ipfs-coord-mock.js'
import config from '../../../config/index.js'
import mockDataLib from '../mocks/adapters/ipfs-coord-mocks.js'

describe('#IPFS', () => {
  let uut
  let sandbox
  let mockData

  beforeEach(() => {
    const ipfs = create()
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
      sandbox.stub(uut, 'publicIp').resolves('123')

      // Force Circuit Relay
      uut.config.isCircuitRelay = true

      const result = await uut.start()
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should exit quietly if this node is a Circuit Relay and there is an issue getting the IP address', async () => {
      // Mock dependencies.
      uut.IpfsCoord = IPFSCoordMock
      sandbox.stub(uut, 'publicIp').rejects(new Error('test error'))

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
    it('should use preferredProvider if set', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }
      // Define already selected service provider.
      uut.state.serviceProviders = [mockData.peers[2]]
      uut.state.selectedServiceProvider = mockData.peers[2]
      // Define preferred provider.
      uut.config.preferredProvider = mockData.peers[0]
      sandbox.stub(uut.semver, 'gt').returns(true)

      await uut.pollForBchServices()

      assert.equal(uut.state.selectedServiceProvider, uut.config.preferredProvider)
    })

    it('should log unknown errors', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }
      sandbox.stub(uut.semver, 'gt').throws(new Error('test error'))

      await uut.pollForBchServices()

      assert.equal(uut.state.selectedServiceProvider, '')
      assert.isOk(true, 'Not throwing an error is a success.')
    })
    it('should handle ipfsCoord errors', async () => {
      uut.ipfsCoord = {
      }

      await uut.pollForBchServices()

      assert.equal(uut.state.selectedServiceProvider, '')
      assert.isOk(true, 'Not throwing an error is a success.')
    })
  })

  describe('#pollForP2wdbServices', () => {
    it('should poll for P2WDB services', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }
      sandbox.stub(uut.semver, 'gt').returns(true)

      await uut.pollForP2wdbServices()

      assert.equal(uut.state.selectedP2wdbProvider, mockData.peers[2])
    })
    it('should use preferredP2wdbProvider if set', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }

      uut.config.preferredP2wdbProvider = mockData.peers[2]
      sandbox.stub(uut.semver, 'gt').returns(true)

      await uut.pollForP2wdbServices()

      assert.equal(uut.state.selectedP2wdbProvider, uut.config.preferredP2wdbProvider)
    })
    it('should handle a peer that does not match the protocol', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }
      sandbox.stub(uut.semver, 'gt').returns(false)

      await uut.pollForP2wdbServices()

      assert.equal(uut.state.selectedP2wdbProvider, '')
    })
    it('should log unknown errors', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }
      sandbox.stub(uut.semver, 'gt').throws(new Error('test error'))

      await uut.pollForP2wdbServices()

      assert.equal(uut.state.selectedP2wdbProvider, '')
      assert.isOk(true, 'Not throwing an error is a success.')
    })
    it('should handle ipfsCoord errors', async () => {
      uut.ipfsCoord = {
      }

      await uut.pollForP2wdbServices()

      assert.equal(uut.state.selectedP2wdbProvider, '')
      assert.isOk(true, 'Not throwing an error is a success.')
    })
  })

  describe('#pollForIpfsFileServices', () => {
    it('should poll for IPFS File services', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }
      sandbox.stub(uut.semver, 'gt').returns(true)

      await uut.pollForIpfsFileServices()

      assert.equal(uut.state.selectedIpfsFileProvider, mockData.peers[3])
    })
    it('should use preferredIpfsFileProvider if set', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }
      // Define already selected service provider.
      uut.state.ipfsFileProviders = [mockData.peers[0]]
      uut.state.selectedIpfsFileProvider = mockData.peers[0]

      uut.config.preferredIpfsFileProvider = mockData.peers[3]
      sandbox.stub(uut.semver, 'satisfies').returns(true)

      await uut.pollForIpfsFileServices()

      assert.equal(uut.state.selectedIpfsFileProvider, uut.config.preferredIpfsFileProvider)
    })
    it('should handle a peer that does not match the protocol', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }
      sandbox.stub(uut.semver, 'satisfies').returns(false)

      await uut.pollForIpfsFileServices()

      assert.equal(uut.state.selectedIpfsFileProvider, '')
    })
    it('should log unknown errors', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        thisNode: {
          peerList: mockData.peers,
          peerData: mockData.peerData
        }
      }
      sandbox.stub(uut.semver, 'satisfies').throws(new Error('test error'))

      await uut.pollForIpfsFileServices()

      assert.equal(uut.state.selectedIpfsFileProvider, '')
      assert.isOk(true, 'Not throwing an error is a success.')
    })
    it('should handle ipfsCoord errors', async () => {
      uut.ipfsCoord = {
      }

      await uut.pollForIpfsFileServices()

      assert.equal(uut.state.selectedIpfsFileProvider, '')
      assert.isOk(true, 'Not throwing an error is a success.')
    })
  })
})
