/*
  Unit tests for the IPFS Adapter.
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'
import cloneDeep from 'lodash.clonedeep'
// import { peerIdFromString } from '@libp2p/peer-id'

// Local libraries
import IPFSLib from '../../../src/adapters/ipfs/ipfs.js'
// import create from '../mocks/ipfs-mock.js'
import config from '../../../config/index.js'
import createHeliaLib from '../mocks/helia-mock.js'

// config.isProduction =  true;
describe('#IPFS-adapter', () => {
  let uut
  let sandbox
  let ipfs

  beforeEach(() => {
    uut = new IPFSLib()

    ipfs = cloneDeep(createHeliaLib)

    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#constructor', () => {
    it('should instantiate IPFS Lib in dev mode.', async () => {
      const _uut = new IPFSLib()
      assert.exists(_uut)
      assert.isFunction(_uut.start)
      assert.isFunction(_uut.stop)
    })

    it('should instantiate dev IPFS Lib in production mode.', async () => {
      config.isProduction = true
      const _uut = new IPFSLib()
      assert.exists(_uut)
      assert.isFunction(_uut.start)
      assert.isFunction(_uut.stop)
      config.isProduction = false
    })
  })

  describe('#start', () => {
    it('should return a promise that resolves into an instance of IPFS.', async () => {
      // Mock dependencies.
      sandbox.stub(uut, 'createNode').resolves(ipfs)
      sandbox.stub(uut, 'publicIp').resolves('192.168.2.4')
      sandbox.stub(uut, 'multiaddr').returns('/ip4/fake-multiaddr')

      const result = await uut.start()
      // console.log('result: ', result)

      // Assert properties of the instance are set.
      assert.equal(uut.isReady, true)
      assert.property(uut, 'multiaddrs')
      assert.property(uut, 'id')

      // Output should be an instance of IPFS
      assert.property(result, 'libp2p')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut, 'createNode').rejects(new Error('test error'))

        await uut.start()
        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#stop', () => {
    it('should stop the IPFS node', async () => {
      // Mock dependencies
      uut.ipfs = {
        stop: () => {
        }
      }

      const result = await uut.stop()

      assert.equal(result, true)
    })
  })

  describe('#ensureBlocksDir', () => {
    it('should create directory if it does not exist', () => {
      // Force desired code path
      sandbox.stub(uut.fs, 'existsSync').returns(false)
      sandbox.stub(uut.fs, 'mkdirSync').returns(true)

      const result = uut.ensureBlocksDir()

      assert.equal(result, true)
    })

    it('should report and throw errors', () => {
      // Force an error
      sandbox.stub(uut.fs, 'existsSync').throws(new Error('test error'))

      try {
        uut.ensureBlocksDir()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#createNode', () => {
    it('should report and throw errors', async () => {
      // Force an error
      sandbox.stub(uut, 'createLibp2p').rejects(new Error('test error'))

      try {
        await uut.createNode()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })

    it('should create an IPFS node from Helia', async () => {
      uut.config.isCircuitRelay = false
      const result = await uut.createNode()
      // console.log('result: ', result)

      // Assert the returned IPFS node has expected properties
      assert.property(result, 'libp2p')
      assert.property(result, 'blockstore')

      // Stop the IPFS node
      await result.stop()
    })

    it('should create a Circuit Relay if configured', async () => {
      uut.config.isCircuitRelay = true
      const result = await uut.createNode()

      // Assert the returned IPFS node has expected properties
      assert.property(result, 'libp2p')
      assert.property(result, 'blockstore')

      // Stop the IPFS node
      await result.stop()
    })

    it('should create a new private key on first run', async () => {
      uut.config.isCircuitRelay = false

      // Mock dependencies and force desired code path.
      // const beenCalled = false
      // sandbox.stub(uut, 'getKeychain').resolves({
      //   exportPeerId: async () => {
      //     if (!beenCalled) {
      //       beenCalled = true
      //       throw new Error('test error')
      //     }
      //     return peerIdFromString('12D3KooWSXF1PnEfiA8bCG8SJduCvzdwHtvhVPK4WC6zzDoto2XP')
      //   },
      //   createKey: async () => {}
      // })
      sandbox.stub(uut, 'createLibp2p').resolves()
      sandbox.stub(uut, 'createHelia').resolves({})

      const result = await uut.createNode()
      // console.log('result: ', result)

      assert.property(result, 'fs')
    })

    it('should not use circuit relay when CONNECT_PREF is set to direct', async () => {
      process.env.CONNECT_PREF = 'direct'

      uut.config.isCircuitRelay = false
      const result = await uut.createNode()
      // console.log('result: ', result)

      delete process.env.CONNECT_PREF

      // Assert the returned IPFS node has expected properties
      assert.property(result, 'libp2p')
      assert.property(result, 'blockstore')

      // Stop the IPFS node
      await result.stop()
    })
  })

  describe('#getSeed', () => {
    it('should read the seed from the JSON file', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.jsonFiles, 'readJSON').resolves('12345678')

      const result = await uut.getSeed()
      // console.log('result: ', result)

      assert.isString(result)
    })

    it('should generate a new seed if the JSON file is not found', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.jsonFiles, 'readJSON').rejects(new Error('test error'))
      sandbox.stub(uut.jsonFiles, 'writeJSON').resolves()

      const result = await uut.getSeed()
      // console.log('result: ', result)

      assert.isString(result)
    })

    it('should catch, report, and throw errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut.jsonFiles, 'readJSON').rejects(new Error('test error'))
        sandbox.stub(uut.jsonFiles, 'writeJSON').rejects(new Error('test error'))

        await uut.getSeed()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
