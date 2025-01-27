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

class UsageUseCaseMock {
  async cleanUsage() {
    return {}
  }

  async getRestSummary() {
    return true
  }

  async getTopIps(params) {
    return true
  }

  async getTopEndpoints(existingUser, newData) {
    return true
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
  usage = new UsageUseCaseMock()
}

export default UseCasesMock;
