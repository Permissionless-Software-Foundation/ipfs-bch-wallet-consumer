/*
  This index file for the Clean Architecture Controllers loads dependencies,
  creates instances, and attaches the controller to REST API endpoints for
  Koa.
*/

// Public npm libraries.

// Load the REST API Controllers.
const AuthRESTController = require('./auth')
const UserRouter = require('./users')
const ContactRESTController = require('./contact')
const LogsRESTController = require('./logs')
const BchRESTController = require('./bch')
const IpfsRESTController = require('./ipfs')
const P2wdbRESTController = require('./p2wdb')
const PriceRESTController = require('./price')

class RESTControllers {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating REST Controller libraries.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating REST Controller libraries.'
      )
    }

    // console.log('Controllers localConfig: ', localConfig)
  }

  attachRESTControllers (app) {
    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Attach the REST API Controllers associated with the /auth route
    const authRESTController = new AuthRESTController(dependencies)
    authRESTController.attach(app)

    // Attach the REST API Controllers associated with the /user route
    const userRouter = new UserRouter(dependencies)
    userRouter.attach(app)

    // Attach the REST API Controllers associated with the /contact route
    const contactRESTController = new ContactRESTController(dependencies)
    contactRESTController.attach(app)

    // Attach the REST API Controllers associated with the /logs route
    const logsRESTController = new LogsRESTController(dependencies)
    logsRESTController.attach(app)

    // Attach the REST API Controllers associated with the /bch route
    const bchRESTController = new BchRESTController(dependencies)
    bchRESTController.attach(app)

    // Attach the REST API Controllers associated with the /ipfs route
    const ipfsRESTController = new IpfsRESTController(dependencies)
    ipfsRESTController.attach(app)

    // Attach the REST API Controllers associated with the /p2wdb route
    const p2wdbRESTController = new P2wdbRESTController(dependencies)
    p2wdbRESTController.attach(app)

    // Attach the REST API Controllers associated with the /price route
    const priceRESTController = new PriceRESTController(dependencies)
    priceRESTController.attach(app)
  }
}

module.exports = RESTControllers
