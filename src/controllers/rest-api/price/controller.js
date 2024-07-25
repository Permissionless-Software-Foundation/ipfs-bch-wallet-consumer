/*
  REST API Controller library for the /bch route
*/

import axios from 'axios'
import wlogger from '../../../adapters/wlogger.js'

// let _this

class PriceRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /price REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /price REST Controller.'
      )
    }

    // Encapsulate dependencies
    this.axios = axios
    // this.UserModel = this.adapters.localdb.Users
    // this.userUseCases = this.useCases.user

    // Bind 'this' object to all subfunctions
    this.getUSD = this.getUSD.bind(this)
    this.getXecPrice = this.getXecPrice.bind(this)
    this.getPsffppWritePrice = this.getPsffppWritePrice.bind(this)
  }

  /**
   * @api {get} /price/usd Get the USD price of BCH
   * @apiName Get the USD price of BCH
   * @apiGroup Price
   * @apiDescription Get the USD price of BCH from Coinbase.
   *
   *
   * @apiExample Example usage:
   * curl -X GET "http://localhost:5005/price/usd" -H "accept: application/json"
   *
   */
  async getUSD (ctx) {
    try {
      // Request options
      const opt = {
        method: 'get',
        baseURL: 'https://api.coinbase.com/v2/',
        url: '/exchange-rates?currency=BCH',
        timeout: 15000
      }

      const response = await this.axios.request(opt)
      // console.log(`response.data: ${JSON.stringify(response.data, null, 2)}`)

      ctx.body = { usd: Number(response.data.data.rates.USD) }
    } catch (err) {
      // Write out error to error log.
      wlogger.error('Error in GET /price/usd.', err)

      this.handleError(ctx, err)
    }
  }

  // Get the XEC price.
  // TODO: Add API docs.
  async getXecPrice (ctx) {
    try {
      // Request options
      const opt = {
        method: 'get',
        baseURL: 'https://api.coinex.com',
        url: '/v1/market/ticker?market=xecusdt',
        timeout: 15000
      }
      //

      const response = await this.axios.request(opt)
      console.log(`response.data: ${JSON.stringify(response.data, null, 2)}`)

      ctx.body = { usd: Number(response.data.data.ticker.last) }
    } catch (err) {
      // Write out error to error log.
      wlogger.error('Error in GET /price/xecusd.', err)

      this.handleError(ctx, err)
    }
  }

  // Get the write price in PSF tokens to pin 1MB to the PSFFPP.
  // TODO: Add API docs.
  // curl -X GET http://localhost:5015/price/psffpp
  async getPsffppWritePrice (ctx) {
    try {
      const psfPrice = await this.useCases.ipfs.getWritePrice()

      ctx.body = { psfPrice }
    } catch (err) {
      // Write out error to error log.
      wlogger.error('Error in GET /price/getPsffppWritePrice', err)

      this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

// module.exports = PriceRESTControllerLib
export default PriceRESTControllerLib
