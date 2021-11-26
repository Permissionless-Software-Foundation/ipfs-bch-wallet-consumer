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
   * @api {get} /status Get status on BCH infrastructure
   * @apiPermission public
   * @apiName GetBchStatus
   * @apiGroup REST BCH
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5000/bch
   *
   */
  async getStatus (ctx) {
    try {
      // const users = await _this.useCases.user.getAllUsers()
      const status = {
        test: 'test'
      }

      ctx.body = { status }
    } catch (err) {
      wlogger.error('Error in bch/controller.js/getStatus(): ')
      ctx.throw(422, err.message)
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
