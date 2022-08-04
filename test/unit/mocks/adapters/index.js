/*
  Mocks for the Adapter library.
*/

class IpfsAdapter {
  constructor () {
    this.ipfs = {
      files: {
        stat: () => {}
      }
    }
  }
}

class IpfsCoordAdapter {
  constructor () {

    this.ipfsCoord = {
      useCases: {
        peer: {
          sendPrivateMessage: () => {}
        }
      },
      thisNode: {
        peerData: []
      }
    },

    this.peerInputHandler = () => {}

    this.state = {
      serviceProviders: []
    }
  }
}

const ipfs = {
  ipfsAdapter: new IpfsAdapter(),
  ipfsCoordAdapter: new IpfsCoordAdapter()
}
ipfs.ipfs = ipfs.ipfsAdapter.ipfs

const localdb = {
  Users: class Users {
    static findById () {}
    static find () {}
    static findOne () {
      return {
        validatePassword: localdb.validatePassword
      }
    }

    async save () {
      return {}
    }

    generateToken () {
      return '123'
    }

    toJSON () {
      return {}
    }

    async remove () {
      return true
    }

    async validatePassword () {
      return true
    }
  },

  validatePassword: () => {
    return true
  }
}

class BchUseCaseMock {
  rpcHandler () {
    return {}
  }

  async getStatus () {
    return {}
  }

  async getBalances () {
    return {}
  }

  async getUtxos () {
    return {}
  }

  async broadcast () {
    return {}
  }

  async getTransaction () {
    return {}
  }

  async getTransactions () {
    return {}
  }

  async getPubKey () {
    return {}
  }

  async utxoIsValid() {
    return {}
  }

  async getTokenData() {
    return {}
  }

  async waitForRPCResponse () {
    return {}
  }
}
const bch = new BchUseCaseMock()

module.exports = { ipfs, localdb, bch }
