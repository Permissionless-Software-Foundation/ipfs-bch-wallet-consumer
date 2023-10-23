/*
  Mocks for the use cases.
*/
/* eslint-disable */

class UserUseCaseMock {
  async createUser(userObj) {
    return {}
  }

  async getAllUsers() {
    return true
  }

  async getUser(params) {
    return true
  }

  async updateUser(existingUser, newData) {
    return true
  }

  async deleteUser(user) {
    return true
  }

  async authUser(login, passwd) {
    return {
      generateToken: () => {}
    }
  }
}

class BchUseCaseMock {
  rpcHandler() {
    return {}
  }

  async getStatus() {
    return {}
  }

  async getBalances() {
    return {}
  }

  async waitForRPCResponse() {
    return {}
  }
}

class UseCasesMock {
  constuctor(localConfig = {}) {
    // this.user = new UserUseCaseMock(localConfig)
    // this.user = new UserUseCaseMock()
    // this.bch = new BchUseCaseMock()
  }

  user = new UserUseCaseMock()
  bch = new BchUseCaseMock()
}

export default UseCasesMock;
