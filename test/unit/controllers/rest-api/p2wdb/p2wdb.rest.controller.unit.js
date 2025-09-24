/*
  Unit tests for the REST API handler for the /p2wdb endpoints.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'

import P2wdbController from '../../../../../src/controllers/rest-api/p2wdb/controller.js'
import { context } from '../../../mocks/ctx-mock.js'
// import blah '../../../../unit/mocks/ctx-mock.js'
// console.log('blah: ', blah)
let uut
let sandbox
let ctx

describe('#P2WDB-REST-Controller', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new P2wdbController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    ctx = context()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new P2wdbController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /p2wdb REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new P2wdbController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /p2wdb REST Controller.'
        )
      }
    })
  })

  describe('#handleError', () => {
    it('should pass an error message', () => {
      try {
        const err = {
          status: 422,
          message: 'Unprocessable Entity'
        }

        uut.handleError(ctx, err)
      } catch (err) {
        assert.include(err.message, 'Unprocessable Entity')
      }
    })
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
  })

  describe('#getStatus', () => {
    it('should return 422 status on arbitrary biz logic error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.p2wdb, 'getStatus')
          .rejects(new Error('test error'))

        await uut.getStatus(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.p2wdb, 'getStatus').resolves('p2wdb')

      await uut.getStatus(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      // Assert that expected properties exist in the returned data.
      assert.equal(ctx.response.body.status, 'p2wdb')
    })
  })

  describe('#postProvider', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.p2wdb, 'selectProvider')
          .rejects(new Error('test error'))

        ctx.request.body = {
          addresses: 'blah'
        }

        await uut.postProvider(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.p2wdb, 'selectProvider').resolves({ status: 200 })

      ctx.request.body = {
        addresses: 'blah'
      }

      await uut.postProvider(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })
  describe('#getEntryByHash', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.p2wdb, 'getEntryByHash')
          .rejects(new Error('test error'))

        ctx.request.body = {
          hash: 'blah'
        }

        await uut.getEntryByHash(ctx)
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.p2wdb, 'getEntryByHash').resolves({ status: 200 })

      ctx.request.body = {
        hash: 'blah'
      }

      await uut.getEntryByHash(ctx)
      assert.equal(ctx.status, 200)
    })
  })

  describe('#writeEntry', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.p2wdb, 'writeEntry')
          .rejects(new Error('test error'))

        ctx.request.body = {
          txid: 'blah',
          signature: 'blah',
          message: 'blah',
          data: 'blah'
        }

        await uut.writeEntry(ctx)
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.p2wdb, 'writeEntry').resolves({ status: 200 })

      ctx.request.body = {
        txid: 'blah',
        signature: 'blah',
        message: 'blah',
        data: 'blah'
      }

      await uut.writeEntry(ctx)
      assert.equal(ctx.status, 200)
    })
  })
})
