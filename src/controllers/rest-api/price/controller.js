/*
  REST API Controller library for the /bch route
*/

const axios = require('axios')
const { wlogger } = require('../../../adapters/wlogger')

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

    // _this = this
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

module.exports = PriceRESTControllerLib
