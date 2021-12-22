/*
  REST API Controller library for the /p2wdb route
*/

const { wlogger } = require('../../../adapters/wlogger')

// let _this

class P2wdbRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /p2wdb REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /p2wdb REST Controller.'
      )
    }

    // Encapsulate dependencies
    // this.UserModel = this.adapters.localdb.Users
    // this.userUseCases = this.useCases.user

    // _this = this
  }

  /**
   * @api {get} /p2wdb Get status on P2WDB infrastructure
   * @apiPermission public
   * @apiName GetP2wdbStatus
   * @apiGroup REST BCH
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/p2wdb
   *
   */
  async getStatus (ctx) {
    try {
      const status = await this.adapters.p2wdb.getStatus()

      ctx.body = { status }
    } catch (err) {
      wlogger.error('Error in bch/controller.js/getStatus(): ')
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  // async postProvider (ctx) {
  //   try {
  //     const providerId = ctx.request.body.provider
  //
  //     await this.adapters.bch.selectProvider(providerId)
  //
  //     const body = {
  //       success: true
  //     }
  //
  //     ctx.body = body
  //   } catch (err) {
  //     wlogger.error('Error in bch/controller.js/postProvider(): ')
  //     // ctx.throw(422, err.message)
  //     this.handleError(ctx, err)
  //   }
  // }

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

module.exports = P2wdbRESTControllerLib
