/*
  REST API library for /p2wdb route.
*/

// Public npm libraries.
const Router = require('koa-router')

// Local libraries.
const P2wdbRESTControllerLib = require('./controller')
const Validators = require('../middleware/validators')

let _this

class P2wdbRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating P2WDB REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating P2WDB REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.p2wdbRESTController = new P2wdbRESTControllerLib(dependencies)
    this.validators = new Validators()

    // Instantiate the router and set the base route.
    const baseUrl = '/p2wdb'
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
    this.router.post('/provider', this.postProvider)
    this.router.post('/entryFromHash', this.entryFromHash)
    this.router.post('/write', this.write)
    // this.router.post('/broadcast', this.postBroadcast)
    // this.router.post('/transactions', this.postTransactions)
    // this.router.post('/transaction', this.postTransaction)
    // this.router.post('/pubkey', this.postPubKey)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async getStatus (ctx, next) {
    await _this.p2wdbRESTController.getStatus(ctx, next)
  }

  async postProvider (ctx, next) {
    await _this.p2wdbRESTController.postProvider(ctx, next)
  }

  async entryFromHash (ctx, next) {
    await _this.p2wdbRESTController.getEntryByHash(ctx, next)
  }

  async write (ctx, next) {
    await _this.p2wdbRESTController.writeEntry(ctx, next)
  }

  // async postBroadcast (ctx, next) {
  //   await _this.bchRESTController.broadcast(ctx, next)
  // }
  //
  // async postTransactions (ctx, next) {
  //   await _this.bchRESTController.transactions(ctx, next)
  // }
  //
  // async postTransaction (ctx, next) {
  //   await _this.bchRESTController.transaction(ctx, next)
  // }
  //
  // async postPubKey (ctx, next) {
  //   await _this.bchRESTController.pubKey(ctx, next)
  // }
}

module.exports = P2wdbRouter
