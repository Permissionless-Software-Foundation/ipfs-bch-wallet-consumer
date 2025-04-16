/*
  Unit tests for the REST API handler for the /ipfs endpoints.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IpfsApiController from '../../../../../src/controllers/rest-api/ipfs/controller.js'
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'

import { context as mockContext } from '../../../mocks/ctx-mock.js'
let uut
let sandbox
let ctx

describe('#IPFS REST API', () => {
  before(async () => {
  })

  beforeEach(() => {
    const useCases = new UseCasesMock()

    uut = new IpfsApiController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new IpfsApiController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /ipfs REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new IpfsApiController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /ipfs REST Controller.'
        )
      }
    })
  })

  describe('#GET /status', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.ipfs, 'getStatus').rejects(new Error('test error'))

        await uut.getStatus(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getStatus').resolves({ a: 'b' })

      await uut.getStatus(ctx)
      // console.log('ctx.body: ', ctx.body)

      assert.property(ctx.body, 'status')
      assert.equal(ctx.body.status.a, 'b')
    })
  })

  describe('#POST /peers', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.ipfs, 'getPeers').rejects(new Error('test error'))

        ctx.request.body = {
          showAll: true
        }

        await uut.getPeers(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves({ a: 'b' })

      ctx.request.body = {
        showAll: true
      }

      await uut.getPeers(ctx)
      // console.log('ctx.body: ', ctx.body)

      assert.property(ctx.body, 'peers')
      assert.equal(ctx.body.peers.a, 'b')
    })
  })

  describe('#POST /relays', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.ipfs, 'getRelays').rejects(new Error('test error'))

        await uut.getRelays(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getRelays').resolves({ a: 'b' })

      await uut.getRelays(ctx)
      // console.log('ctx.body: ', ctx.body)

      assert.property(ctx.body, 'relays')
      assert.equal(ctx.body.relays.a, 'b')
    })
  })

  describe('#POST /connect', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.adapters.ipfs, 'connectToPeer').rejects(new Error('test error'))

        ctx.request.body = {
          multiaddr: '/ip4/161.35.99.207/tcp/4001/p2p/12D3KooWDtj9cfj1SKuLbDNKvKRKSsGN8qivq9M8CYpLPDpcD5pu'
        }

        await uut.connect(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.adapters.ipfs, 'connectToPeer').resolves({ success: true })

      ctx.request.body = {
        multiaddr: '/ip4/161.35.99.207/tcp/4001/p2p/12D3KooWDtj9cfj1SKuLbDNKvKRKSsGN8qivq9M8CYpLPDpcD5pu'
      }

      await uut.connect(ctx)
      // console.log('ctx.body: ', ctx.body)

      assert.property(ctx.body, 'success')
      assert.equal(ctx.body.success, true)
    })
  })

  describe('#handleError', () => {
    it('should still throw error if there is no message', () => {
      try {
        const err = {
          status: 404
        }

        uut.handleError(ctx, err)
      } catch (err) {
        assert.include(err.message, 'Not Found')
      }
    })

    it('should throw error with message', () => {
      try {
        const err = {
          status: 422,
          message: 'test error'
        }

        uut.handleError(ctx, err)
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getThisNode', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        // Force an error
        // sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord, 'thisNode').rejects(new Error('test error'))
        uut.adapters.ipfs.ipfsCoordAdapter = {}

        ctx.request.body = {}

        await uut.getThisNode(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should return 200 status on success', async () => {
      // Mock dependencies
      // sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.adapters.ipfs, 'connectToPeer').resolves({ success: true })

      uut.adapters.ipfs.ipfsCoordAdapter = {
        ipfsCoord: {
          thisNode: {}
        }
      }

      ctx.request.body = {}

      await uut.getThisNode(ctx)

      assert.property(ctx.body, 'thisNode')
    })
  })
  describe('#viewFile', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        // Force an error
        ctx.params = {
          cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy'
        }
        sandbox.stub(uut.useCases.ipfs, 'downloadCid').throws(new Error('test error'))
        uut.adapters.ipfs.ipfsCoordAdapter = {}

        ctx.request.body = {}

        await uut.viewFile(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      ctx.params = {
        cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy'
      }
      // Mock dependencies
      sandbox.stub(uut.useCases.ipfs, 'downloadCid').resolves({ success: true, readStream: 'readStream' })

      uut.adapters.ipfs.ipfsCoordAdapter = {
        ipfsCoord: {
          thisNode: {}
        }
      }

      ctx.request.body = {}

      await uut.viewFile(ctx)

      assert.exists(ctx.body)
    })
  })
  describe('#downloadFile', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        ctx.params = {
          cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy'
        }
        // Force an error
        sandbox.stub(uut.useCases.ipfs, 'downloadCid').throws(new Error('test error'))
        uut.adapters.ipfs.ipfsCoordAdapter = {}

        ctx.request.body = {}

        await uut.downloadFile(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      ctx.params = {
        cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy'
      }
      // Mock dependencies
      sandbox.stub(uut.useCases.ipfs, 'downloadCid').resolves({ success: true, readStream: 'readStream' })

      uut.adapters.ipfs.ipfsCoordAdapter = {
        ipfsCoord: {
          thisNode: {}
        }
      }

      ctx.request.body = {}

      await uut.downloadFile(ctx)

      assert.exists(ctx.body)
    })
  })
  describe('#getService', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        // Force an error
        uut.adapters.ipfs.ipfsCoordAdapter = {}

        ctx.request.body = {}

        await uut.getService(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read properties of undefined')
      }
    })

    it('should return 200 status on success', async () => {
      // Mock dependencies

      uut.adapters.ipfs.ipfsCoordAdapter = {
        state: {
          selectedIpfsFileProvider: 'provider'
        }
      }

      ctx.request.body = {}

      await uut.getService(ctx)

      assert.isTrue(ctx.body.success)
    })
  })
  describe('#getFileInfo', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        ctx.params = {
          cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy'
        }
        sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').throws(new Error('test error'))

        ctx.request.body = {}

        await uut.getFileInfo(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      ctx.params = {
        cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy'
      }
      // Mock dependencies
      sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ success: true, filename: 'filename' })

      ctx.request.body = {}

      await uut.getFileInfo(ctx)

      assert.isTrue(ctx.body.success)
    })
  })

  describe('#getPins', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'getPins').throws(new Error('test error'))

        ctx.request.body = {}
        ctx.params = { page: 1}

        await uut.getPins(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      // Mock dependencies
      sandbox.stub(uut.adapters.ipfsFiles, 'getPins').resolves({ success: true })

      ctx.request.body = {}
      ctx.params = { page: 1}

      await uut.getPins(ctx)

      assert.isTrue(ctx.body.success)
    })
  })
  
  describe('#cid2json', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        ctx.params = {
          cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy'
        }
        sandbox.stub(uut.useCases.ipfs, 'cid2json').throws(new Error('test error'))

        ctx.request.body = {}

        await uut.cid2json(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      ctx.params = {
        cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy'
      }
      // Mock dependencies
      sandbox.stub(uut.useCases.ipfs, 'cid2json').resolves({ success: true })

      ctx.request.body = {}

      await uut.cid2json(ctx)

      assert.isTrue(ctx.body.success)
    })
  })
  describe('#pinClaim', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        sandbox.stub(uut.useCases.ipfs, 'pinClaim').throws(new Error('test error'))

        ctx.request.body = {}

        await uut.pinClaim(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      // Mock dependencies
      sandbox.stub(uut.useCases.ipfs, 'pinClaim').resolves({ success: true })

      ctx.request.body = {}

      await uut.pinClaim(ctx)

      assert.isTrue(ctx.body.success)
    })
  })
})
