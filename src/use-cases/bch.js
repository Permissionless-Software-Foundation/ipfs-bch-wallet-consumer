/*
  This library contains business-logic for dealing with BCH wallet service
  providers. Most of these functions are called by the /bch REST API endpoints.
*/

// const UserEntity = require('../entities/user')
const { wlogger } = require('../adapters/wlogger')

class BchUseCases {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating User Use Cases library.'
      )
    }

    // Encapsulate dependencies
    // this.UserEntity = new UserEntity()
    // this.UserModel = this.adapters.localdb.Users
  }

  async getStatus () {
    try {
      const status = {
        test: 'test'
      }

      console.log(
        'this.adapters.ipfs.ipfsCoordAdapter.state: ',
        this.adapters.ipfs.ipfsCoordAdapter.state
      )

      return status
    } catch (err) {
      // console.log('createUser() error: ', err)
      wlogger.error('Error in use-cases/bch.js/getStatus()')
      throw err
    }
  }
}

module.exports = BchUseCases
