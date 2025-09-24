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

import BchRouter from '../../../../../src/controllers/rest-api/bch/index.js'
let uut
let sandbox
// let ctx

// const mockContext = require('../../../../unit/mocks/ctx-mock').context

describe('#BCH-REST-Router', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new BchRouter({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    // ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new BchRouter()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating BCH REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new BchRouter({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating BCH REST Controller.'
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
      const spy = sandbox.stub(uut.bchRESTController, 'getStatus').resolves(true)

      await uut.getStatus()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#postProvider', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'postProvider').resolves(true)

      await uut.postProvider()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#postBalance', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'balance').resolves(true)

      await uut.postBalance()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#postUtxos', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'utxos').resolves(true)

      await uut.postUtxos()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#postUtxosBulk', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'utxosBulk').resolves(true)

      await uut.postUtxosBulk()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#postBroadcast', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'broadcast').resolves(true)

      await uut.postBroadcast()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#postTxHistory', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'txHistory').resolves(true)

      await uut.postTxHistory()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#postTxData', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'txData').resolves(true)

      await uut.postTxData()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#postPubKey', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'pubKey').resolves(true)

      await uut.postPubKey()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#utxoIsValid', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'utxoIsValid').resolves(true)

      await uut.utxoIsValid()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#getTokenData', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'getTokenData').resolves(true)

      await uut.getTokenData()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#getTokenData2', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'getTokenData2').resolves(true)

      await uut.getTokenData2()
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#getService', () => {
    it('should route to controller', async () => {
      const spy = sandbox.stub(uut.bchRESTController, 'getService').resolves(true)

      await uut.getService()
      assert.isTrue(spy.calledOnce)
    })
  })
})
