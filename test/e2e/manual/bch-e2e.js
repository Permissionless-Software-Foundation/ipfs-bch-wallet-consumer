/*
  To run this end-to-end test:

  - Start the REST API server with `npm start`, wait for it to find a BCH wallet server.
  - Run this test app with `mocha --timeout=30000 bch-e2e.js`

  This test will query each REST API endpoint and ensure they are working correctly.
*/

const SERVER = 'http://localhost:5005'

const axios = require('axios')
const assert = require('chai').assert

describe('#BCH E2E Tests', () => {
  console.log(
    'Ensure the REST API app has been started and has found a BCH wallet service provider, before running this test.'
  )

  describe('#status', () => {
    it('should report at least one service provider', async () => {
      const url = `${SERVER}/bch`
      const result = await axios.get(url)
      // console.log(`data: ${JSON.stringify(result.data, null, 2)}`)

      assert.isAbove(result.data.status.serviceProviders.length, 0)
      assert.isOk(result.data.status.selectedProvider)
    })
  })

  describe('#balance', () => {
    it('should get the balance for an address', async () => {
      const body = {
        addresses: 'bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj'
      }

      const url = `${SERVER}/bch/balance`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      assert.equal(result.data.success, true)
      assert.equal(result.data.status, 200)
      assert.property(result.data, 'balance')
      assert.property(result.data.balance, 'confirmed')
      assert.property(result.data.balance, 'unconfirmed')
    })
  })

  describe('#utxos', () => {
    it('should get UTXOs for an address', async () => {
      const body = {
        address: 'bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj'
      }

      const url = `${SERVER}/bch/utxos`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      assert.equal(result.data[0].address, body.address)
      assert.property(result.data[0], 'bchUtxos')
      assert.property(result.data[0], 'slpUtxos')
    })
  })

  describe('#broadcast', () => {
    it('should attempt to broadcast a transaction', async () => {
      const body = {
        hex: '01000000013ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a000000006a4730440220540986d1c58d6e76f8f05501c520c38ce55393d0ed7ed3c3a82c69af04221232022058ea43ed6c05fec0eccce749a63332ed4525460105346f11108b9c26df93cd72012103083dfc5a0254613941ddc91af39ff90cd711cdcde03a87b144b883b524660c39ffffffff01807c814a000000001976a914d7e7c4e0b70eaa67ceff9d2823d1bbb9f6df9a5188ac00000000'
      }

      const url = `${SERVER}/bch/broadcast`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      assert.equal(result.data.status, 422)
      assert.equal(result.data.success, false)
      assert.equal(result.data.message, 'Missing inputs')
      assert.equal(result.data.endpoint, 'broadcast')
    })
  })

  describe('#pubkey', () => {
    it('should return "not found" if pubkey is not on chain', async () => {
      const body = {
        address: 'bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj'
      }

      const url = `${SERVER}/bch/pubkey`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      assert.equal(result.data.success, true)
      assert.equal(result.data.status, 200)
      assert.equal(result.data.endpoint, 'pubkey')
      assert.equal(result.data.pubkey.success, false)
      assert.equal(result.data.pubkey.publicKey, 'not found')
    })

    it('should get a public key for an address', async () => {
      const body = {
        address: 'bitcoincash:qznxh6yegf7nfrsd0zeksed4jcqzvg7tzqlcqw3v97'
      }

      const url = `${SERVER}/bch/pubkey`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      assert.equal(result.data.success, true)
      assert.equal(result.data.status, 200)
      assert.equal(result.data.endpoint, 'pubkey')
      assert.equal(result.data.pubkey.success, true)
      assert.equal(
        result.data.pubkey.publicKey,
        '03ebd6d6aae05da1c5905445e3886b30f6a31b26a88de5980de236bd22380fa942'
      )
    })
  })

  describe('#transactions', () => {
    it('should get transaction history for an address, and sort by default in descending order.', async () => {
      const address = 'bitcoincash:qpdh9s677ya8tnx7zdhfrn8qfyvy22wj4qa7nwqa5v'
      const body = {
        address
      }

      const url = `${SERVER}/bch/transactions`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      // Assert expected values and properties.
      assert.equal(result.data.status, 200)
      assert.equal(result.data.success, true)
      assert.equal(result.data.address, address)
      assert.isArray(result.data.txs)

      // Assert expected sorting
      assert.isAbove(result.data.txs[0].height, result.data.txs[1].height)
    })

    it('should sort in ascending order.', async () => {
      const address = 'bitcoincash:qpdh9s677ya8tnx7zdhfrn8qfyvy22wj4qa7nwqa5v'

      const body = {
        address,
        sortOrder: 'ASCENDING'
      }

      const url = `${SERVER}/bch/transactions`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      // Assert expected values and properties.
      assert.equal(result.data.status, 200)
      assert.equal(result.data.success, true)
      assert.equal(result.data.address, address)
      assert.isArray(result.data.txs)

      // Assert expected sorting
      assert.isAbove(result.data.txs[1].height, result.data.txs[0].height)
    })

    it('should paginate an address with deep tx history', async () => {
      const body = {
        address: 'bitcoincash:qqlrzp23w08434twmvr4fxw672whkjy0py26r63g3d'
      }

      const url = `${SERVER}/bch/transactions`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      // Assert there is no more than 100 entries
      assert.isBelow(result.data.txs.length, 101)
    })

    it('should get the second page of results', async () => {
      const body = {
        address: 'bitcoincash:qqlrzp23w08434twmvr4fxw672whkjy0py26r63g3d',
        page: 1
      }

      const url = `${SERVER}/bch/transactions`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      // Assert there is no more than 100 entries
      assert.isBelow(result.data.txs.length, 101)
    })
  })

  describe('#transaction', () => {
    it('should get transaction details for a txid', async () => {
      const body = {
        txids: [
          '01517ff1587fa5ffe6f5eb91c99cf3f2d22330cd7ee847e928ce90ca95bf781b'
        ]
      }

      const url = `${SERVER}/bch/transaction`
      const result = await axios.post(url, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      assert.equal(result.data.status, 200)
      assert.isArray(result.data.txData)
      assert.property(result.data.txData[0].txData, 'txid')
      assert.property(result.data.txData[0].txData, 'vin')
    })
  })
})
