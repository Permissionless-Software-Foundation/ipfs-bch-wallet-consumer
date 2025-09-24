/*
  Unit tests for the REST API handler for the /price endpoints.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'

import PriceController from '../../../../../src/controllers/rest-api/price/controller.js'
import { context } from '../../../mocks/ctx-mock.js'
// import blah '../../../../unit/mocks/ctx-mock.js'
// console.log('blah: ', blah)
let uut
let sandbox
let ctx

describe('#PRICE-REST-Controller', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new PriceController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    ctx = context()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new PriceController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /price REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new PriceController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /price REST Controller.'
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

  describe('#getUSD', () => {
    it('should return 422 status on arbitrary biz logic error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.axios, 'request')
          .rejects(new Error('test error'))

        await uut.getUSD(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.axios, 'request').resolves({ data: { data: { rates: { USD: 1.00 } } } })

      await uut.getUSD(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      // Assert that expected properties exist in the returned data.
      assert.equal(ctx.response.body.usd, 1.00)
    })
  })

  describe('#getXecPrice', () => {
    it('should return 422 status on arbitrary biz logic error', async () => {
      try {
        sandbox.stub(uut.axios, 'request').rejects(new Error('test error'))
        await uut.getXecPrice(ctx)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })
    it('should return 200 status on success', async () => {
      sandbox.stub(uut.axios, 'request').resolves({ data: { data: { ticker: { last: 1.00 } } } })
      await uut.getXecPrice(ctx)
      assert.equal(ctx.status, 200)
      assert.equal(ctx.response.body.usd, 1.00)
    })
  })
  describe('#getPsffppWritePrice', () => {
    it('should return 200 status on success', async () => {
      sandbox.stub(uut.useCases.ipfs, 'getWritePrice').resolves(1.00)
      await uut.getPsffppWritePrice(ctx)
      assert.equal(ctx.status, 200)
      assert.equal(ctx.response.body.psfPrice, 1.00)
    })
    it('should return 422 status on arbitrary biz logic error', async () => {
      try {
        sandbox.stub(uut.useCases.ipfs, 'getWritePrice').rejects(new Error('test error'))
        await uut.getPsffppWritePrice(ctx)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })
  })
})
