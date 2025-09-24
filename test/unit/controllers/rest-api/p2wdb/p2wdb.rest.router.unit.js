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

import P2wdbRouter from '../../../../../src/controllers/rest-api/p2wdb/index.js'
let uut
let sandbox
// let ctx

// const mockContext = require('../../../../unit/mocks/ctx-mock').context

describe('#P2WDB-REST-Router', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new P2wdbRouter({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    // ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new P2wdbRouter()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating P2WDB REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new P2wdbRouter({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating P2WDB REST Controller.'
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
  describe('#getStatus', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.p2wdbRESTController, 'getStatus').resolves(true)

      await uut.getStatus()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#postProvider', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.p2wdbRESTController, 'postProvider').resolves(true)

      await uut.postProvider()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#entryFromHash', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.p2wdbRESTController, 'getEntryByHash').resolves(true)

      await uut.entryFromHash()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#write', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.p2wdbRESTController, 'writeEntry').resolves(true)

      await uut.write()
      assert.isTrue(spy.calledOnce)
    })
  })
})
