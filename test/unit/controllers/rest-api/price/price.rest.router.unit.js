/*
  Unit tests for the REST API handler for the /users endpoints.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'
// const app = require('../../../mocks/app-mock')

import PriceRouter from '../../../../../src/controllers/rest-api/price/index.js'
let uut
let sandbox
// let ctx

// const mockContext = require('../../../../unit/mocks/ctx-mock').context

describe('#Price-REST-Router', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new PriceRouter({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    // ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new PriceRouter()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating Price REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new PriceRouter({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating Price REST Controller.'
        )
      }
    })
  })

  describe('#attach', () => {
    it('should throw an error if app is not passed in.', () => {
      try {
        uut.attach()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass app object when attaching REST API controllers.'
        )
      }
    })
  })
  describe('#getPrice', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.priceRESTController, 'getUSD').resolves(true)

      await uut.getPrice()
      assert.isTrue(spy.calledOnce)
    })
  })

  describe('#getXecPrice', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.priceRESTController, 'getXecPrice').resolves(true)

      await uut.getXecPrice()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#getPsffppWritePrice', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.priceRESTController, 'getPsffppWritePrice').resolves(true)
      await uut.getPsffppWritePrice()
      assert.isTrue(spy.calledOnce)
    })
  })
})
