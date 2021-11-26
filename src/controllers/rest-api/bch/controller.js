/*
  REST API Controller library for the /user route
*/

const { wlogger } = require('../../../adapters/wlogger')

// let _this

class BchRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /bch REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /bch REST Controller.'
      )
    }

    // Encapsulate dependencies
    // this.UserModel = this.adapters.localdb.Users
    // this.userUseCases = this.useCases.user

    // _this = this
  }

  /**
   * @api {get} /bch Get status on BCH infrastructure
   * @apiPermission public
   * @apiName GetBchStatus
   * @apiGroup REST BCH
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/bch
   *
   */
  async getStatus (ctx) {
    try {
      const status = await this.useCases.bch.getStatus()

      ctx.body = { status }
    } catch (err) {
      wlogger.error('Error in bch/controller.js/getStatus(): ')
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /bch/balance Balance
   * @apiName Balance
   * @apiGroup REST BCH
   * @apiDescription Returns the BCH balance for an array of addresses.
   *
   *  Given the 'addresses' property returns an array of objects
   *  with the following properties
   *
   *  - success : - Petition status
   *  - balances : [] - Balance of the provided addresses
   *    - balance : {} - Object with the balance types of an address
   *      - confirmed : - Confirmed balance
   *      - unconfirmed : - Unconfirmed Balance
   *    - address : "" - Address related to the balance
   *
   *  Note: For a single address pass the 'addresses' of string type
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "addresses": ["bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj"] }' localhost:5001/bch/balance
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "success":true,
   *        "balances":[
   *           {
   *              "balance":{
   *                 "confirmed":1000,
   *                 "unconfirmed":0
   *              },
   *              "address":"bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj"
   *           }
   *        ]
   *     }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async balance (ctx) {
    try {
      const addrs = ctx.request.body.addresses

      const data = await this.useCases.bch.getBalances(addrs)
      // console.log(`data: ${JSON.stringify(data, null, 2)}`)

      ctx.body = data
    } catch (err) {
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

module.exports = BchRESTControllerLib
