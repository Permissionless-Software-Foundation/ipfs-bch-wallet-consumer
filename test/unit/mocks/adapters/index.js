/*
  Mocks for the Adapter library.
*/
class BlockstoreMock {
  constructor () {
    this.get = async () => {}
  }
}
class FsMock {
  constructor () {
    this.ls = async function* () {
      yield { path: 'test.txt', cid: 'QmS4ghgMgfFvqPjB4WKXHaN15ZyT4K4JYZxY5X5x5x5x5' }
    }
    this.cat = async function* () {
      yield Buffer.from('test data')
    }
  }
}
class IpfsAdapter {
  constructor () {
    this.ipfs = {
      blockstore: new BlockstoreMock(),
      fs: new FsMock(),
      files: {
        stat: () => {}
      }
    }
  }
}

class IpfsCoordAdapter {
  constructor () {
    this.config = {}
    this.ipfsCoord = {
      adapters: {
        ipfs: {
          connectToPeer: async () => {}
        }
      },
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
      serviceProviders: [],
      serviceProvidersByType: '',
      selectedIpfsFileProvider:''
    }
  }
}

const ipfs = {
  ipfsAdapter: new IpfsAdapter(),
  ipfsCoordAdapter: new IpfsCoordAdapter(),
  getStatus: async () => {},
  getPeers: async () => {},
  getRelays: async () => {}
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

  Usage: class Usage {
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
    static async deleteMany(){
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

  async getUtxosBulk () {
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

  async getTokenData2() {
    return {}
  }

  async waitForRPCResponse () {
    return {}
  }
}
const bch = new BchUseCaseMock()
const wallet = {
  bchWallet: bch

}

const ipfsFiles = {
  pinClaim: () => {
    return {
      success: true,
      message: 'Pin claimed'
    }
  },
  getFileMetadata: () => {
    return {
      success: true,
      message: 'Files metadata'
    }
  },
  getPins: () => {
    return {
      success: true,
      message: 'Pins'
    }
  }
}
export default { ipfs, localdb, bch, wallet, ipfsFiles }
