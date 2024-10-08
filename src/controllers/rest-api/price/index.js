/*
  REST API library for /bch route.
*/

// Public npm libraries.
import Router from 'koa-router'

// Local libraries.
import PriceRESTControllerLib from './controller.js'
import Validators from '../middleware/validators.js'

let _this

class PriceRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Price REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Price REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.priceRESTController = new PriceRESTControllerLib(dependencies)
    this.validators = new Validators()

    // Instantiate the router and set the base route.
    const baseUrl = '/price'
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
    this.router.get('/usd', this.getPrice)
    this.router.get('/xecusd', this.getXecPrice)
    this.router.get('/psffpp', this.getPsffppWritePrice)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async getPrice (ctx, next) {
    await _this.priceRESTController.getUSD(ctx, next)
  }

  async getXecPrice (ctx, next) {
    await _this.priceRESTController.getXecPrice(ctx, next)
  }

  async getPsffppWritePrice (ctx, next) {
    await _this.priceRESTController.getPsffppWritePrice(ctx, next)
  }
}

// module.exports = PriceRouter
export default PriceRouter
