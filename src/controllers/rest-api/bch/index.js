/*
  REST API library for /bch route.
*/

// Public npm libraries.
const Router = require('koa-router')

// Local libraries.
const BchRESTControllerLib = require('./controller')
const Validators = require('../middleware/validators')

let _this

class BchRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating BCH REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating BCH REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.bchRESTController = new BchRESTControllerLib(dependencies)
    this.validators = new Validators()

    // Instantiate the router and set the base route.
    const baseUrl = '/bch'
    this.router = new Router({ prefix: baseUrl })

    _this = this
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.get('/', this.getStatus)
    this.router.post('/balance', this.postBalance)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async getStatus (ctx, next) {
    await _this.bchRESTController.getStatus(ctx, next)
  }

  async postBalance (ctx, next) {
    await _this.bchRESTController.balance(ctx, next)
  }
}

module.exports = BchRouter
