/*
  Unit tests for the REST API handler for the /bch endpoints.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'

import BchController from '../../../../../src/controllers/rest-api/bch/controller.js'
import { context } from '../../../../unit/mocks/ctx-mock.js'
// import blah '../../../../unit/mocks/ctx-mock.js'
// console.log('blah: ', blah)
let uut
let sandbox
let ctx

describe('#BCH-REST-Controller', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new BchController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    ctx = context()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new BchController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /bch REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new BchController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /bch REST Controller.'
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
          .stub(uut.adapters.bch, 'getStatus')
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
      sandbox.stub(uut.adapters.bch, 'getStatus').resolves('bch')

      await uut.getStatus(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      // Assert that expected properties exist in the returned data.
      assert.equal(ctx.response.body.status, 'bch')
    })
  })

  describe('#balance', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'getBalances')
          .rejects(new Error('test error'))

        ctx.request.body = {
          addresses: 'blah'
        }

        await uut.balance(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.bch, 'getBalances').resolves({ status: 200 })

      ctx.request.body = {
        addresses: 'blah'
      }

      await uut.balance(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#utxos', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'getUtxos')
          .rejects(new Error('test error'))

        ctx.request.body = {
          address: 'blah'
        }

        await uut.utxos(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.bch, 'getUtxos').resolves({ status: 200 })

      ctx.request.body = {
        address: 'blah'
      }

      await uut.utxos(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#utxosBulk', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'getUtxosBulk')
          .rejects(new Error('test error'))

        ctx.request.body = {
          address: 'blah'
        }

        await uut.utxosBulk(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.bch, 'getUtxosBulk').resolves({ status: 200 })

      ctx.request.body = {
        address: 'blah'
      }

      await uut.utxosBulk(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#broadcast', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'broadcast')
          .rejects(new Error('test error'))

        ctx.request.body = {
          hex: 'blah'
        }

        await uut.broadcast(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.bch, 'broadcast').resolves({ status: 200 })

      ctx.request.body = {
        hex: 'blah'
      }

      await uut.broadcast(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#txHistory', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'getTransactions')
          .rejects(new Error('test error'))

        ctx.request.body = {
          address: 'blah'
        }

        await uut.txHistory(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.bch, 'getUtxos').resolves({ status: 200 })

      ctx.request.body = {
        address: 'blah'
      }

      await uut.txHistory(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#txData', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'getTransaction')
          .rejects(new Error('test error'))

        ctx.request.body = {
          txid: 'blah'
        }

        await uut.txData(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox
        .stub(uut.adapters.bch, 'getTransactions')
        .resolves({ status: 200 })

      ctx.request.body = {
        txid: 'blah'
      }

      await uut.txData(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#pubKey', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'getPubKey')
          .rejects(new Error('test error'))

        ctx.request.body = {
          addr: 'blah'
        }

        await uut.pubKey(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.bch, 'getPubKey').resolves({ status: 200 })

      ctx.request.body = {
        addr: 'blah'
      }

      await uut.pubKey(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#utxoIsValid', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'utxoIsValid')
          .rejects(new Error('test error'))

        ctx.request.body = {
          utxo: 'blah'
        }

        await uut.utxoIsValid(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.bch, 'utxoIsValid').resolves({ status: 200 })

      ctx.request.body = {
        utxo: 'blah'
      }

      await uut.utxoIsValid(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#getTokenData', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'getTokenData')
          .rejects(new Error('test error'))

        ctx.request.body = {
          tokenId: 'blah'
        }

        await uut.getTokenData(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.bch, 'getTokenData').resolves({ status: 200 })

      ctx.request.body = {
        tokenId: 'blah'
      }

      await uut.getTokenData(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#getTokenData2', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.bch, 'getTokenData2')
          .rejects(new Error('test error'))

        ctx.request.body = {
          tokenId: 'blah'
        }

        await uut.getTokenData2(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.bch, 'getTokenData2').resolves({ status: 200 })

      ctx.request.body = {
        tokenId: 'blah'
      }

      await uut.getTokenData2(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#getService', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter, 'state').value(null)
        ctx.request.body = {
          service: 'blah'
        }

        await uut.getService(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should return 200 status on success', async () => {
      sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter, 'state').value({ selectedServiceProvider: 'selected service' })
      ctx.request.body = {
        service: 'selected service'
      }

      await uut.getService(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('#postProvider', () => {
    it('should return 422 status on arbitrary error', async () => {
      try {
        uut.config.freezeProvider = true
        ctx.request.body = {
          providerId: 'selected provider id'
        }

        await uut.postProvider(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        console.log('err: ', err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Consumer has preferredProvider set in environment variable. Refusing to switch providers.')
      }
    })

    it('should return 200 status on success', async () => {
      uut.config.freezeProvider = false
      ctx.request.body = {
        providerId: 'selected provider id'
      }

      sandbox.stub(uut.adapters.bch, 'selectProvider').resolves(true)
      await uut.postProvider(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })
})
