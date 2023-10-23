/*
  REST API Controller library for the /bch route
*/

import wlogger from '../../../adapters/wlogger.js'
import config from '../../../../config/index.js'

// let _this

class BchRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /bch REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /bch REST Controller.'
      )
    }

    // Encapsulate dependencies
    this.config = config
  }

  /**
   * @api {get} /bch Get status on BCH infrastructure
   * @apiPermission public
   * @apiName GetBchStatus
   * @apiGroup REST BCH
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/bch
   *
   */
  async getStatus (ctx) {
    try {
      const status = await this.adapters.bch.getStatus()

      ctx.body = { status }
    } catch (err) {
      wlogger.error('Error in bch/controller.js/getStatus(): ')
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /bch/provider Provider
   * @apiPermission public
   * @apiName Provider
   * @apiGroup REST BCH
   * @apiDescription Select a different BCH wallet service on the IPFS network,
   * for interacting with the BCH blockchain.
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "provider": "QmXtHADckCmT6jodpAgn3TcDQWjC29gQd2fKKHDTpo8DJT" }' localhost:5001/bch/provider
   */
  async postProvider (ctx) {
    try {
      const providerId = ctx.request.body.provider

      // Throw an error, if the provider has been set by an environment variable.
      if (this.config.freezeProvider) {
        throw new Error('Consumer has preferredProvider set in environment variable. Refusing to switch providers.')
      }

      await this.adapters.bch.selectProvider(providerId)

      const body = {
        success: true
      }

      ctx.body = body
    } catch (err) {
      wlogger.error('Error in bch/controller.js/postProvider(): ')
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /bch/balance Balance
   * @apiName Balance
   * @apiGroup REST BCH
   * @apiDescription Returns the BCH balance for an array of addresses.
   *
   *  Given the 'addresses' property returns an array of objects
   *  with the following properties
   *
   *  - success : - Petition status
   *  - balances : [] - Balance of the provided addresses
   *    - balance : {} - Object with the balance types of an address
   *      - confirmed : - Confirmed balance
   *      - unconfirmed : - Unconfirmed Balance
   *    - address : "" - Address related to the balance
   *
   *  Note: For a single address pass the 'addresses' of string type
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "addresses": ["bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj"] }' localhost:5001/bch/balance
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "success":true,
   *        "balances":[
   *           {
   *              "balance":{
   *                 "confirmed":1000,
   *                 "unconfirmed":0
   *              },
   *              "address":"bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj"
   *           }
   *        ]
   *     }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async balance (ctx) {
    try {
      const addrs = ctx.request.body.addresses

      const data = await this.adapters.bch.getBalances(addrs)
      // console.log(`data: ${JSON.stringify(data, null, 2)}`)

      ctx.body = data
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /bch/utxos UTXOs
   * @apiName UTXOs
   * @apiGroup REST BCH
   * @apiDescription This endpoint returns UTXOs held at an address, hydrated
   *  with token information.
   *
   *  Given an address, this endpoint will return an object with thre following
   *  properties:
   *
   *  - address: "" - the address these UTXOs are associated with
   *  - bchUtxos: [] - UTXOs confirmed to be spendable as normal BCH
   *  - nullUtxo: [] - UTXOs that did not pass SLP validation. Should be ignored and
   *    not spent, to be safe.
   *  - slpUtxos: {} - UTXOs confirmed to be colored as valid SLP tokens
   *    - type1: {}
   *      - tokens: [] - SLP token Type 1 tokens.
   *      - mintBatons: [] - SLP token Type 1 mint batons.
   *    - nft: {}
   *      - tokens: [] - NFT tokens
   *      - groupTokens: [] - NFT Group tokens, used to create NFT tokens.
   *      - groupMintBatons: [] - Minting baton to create more NFT Group tokens.
   *
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "address": "bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj" }' localhost:5001/bch/utxos
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     [
   *        {
   *           "address":"bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj",
   *           "bchUtxos":[
   *              {
   *                 "height":631219,
   *                 "tx_hash":"ae2daa01c8172545b5edd205ea438706bcb74e63d4084a26b9ff2a46d46dc97f",
   *                 "tx_pos":0,
   *                 "value":1000,
   *                 "txid":"ae2daa01c8172545b5edd205ea438706bcb74e63d4084a26b9ff2a46d46dc97f",
   *                 "vout":0,
   *                 "isValid":false
   *              }
   *           ],
   *           "nullUtxos":[
   *
   *           ],
   *           "slpUtxos":{
   *              "type1":{
   *                 "mintBatons":[
   *
   *                 ],
   *                 "tokens":[
   *
   *                 ]
   *              },
   *              "nft":{
   *                 "groupMintBatons":[
   *
   *                 ],
   *                 "groupTokens":[
   *
   *                 ],
   *                 "tokens":[
   *
   *                 ]
   *              }
   *           }
   *        }
   *     ]
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async utxos (ctx) {
    try {
      const address = ctx.request.body.address
      // console.log('address: ', address)

      const utxos = await this.adapters.bch.getUtxos(address)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      ctx.body = [utxos]
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /bch/utxosBulk UTXOs Bulk
   * @apiName UTXOs Bulk
   * @apiGroup REST BCH
   * @apiDescription This endpoint returns UTXOs held at an address, hydrated
   *  with token information.
   * @apiDescription This endpoint is the same as the /bch/utxos endpoint, but
   * it allows an array of up to 20 addresses to be queried at the same time.
   * This reduces the number of JSON RPC calls, and is very handy
   * for HD wallets that need to quickly scan a lot of addresses.
   *
   *  Given an address, this endpoint will return an object with thre following
   *  properties:
   *
   *  - addresses: [] - the addresses these UTXOs are associated with
   *  - bchUtxos: [] - UTXOs confirmed to be spendable as normal BCH
   *  - nullUtxo: [] - UTXOs that did not pass SLP validation. Should be ignored and
   *    not spent, to be safe.
   *  - slpUtxos: {} - UTXOs confirmed to be colored as valid SLP tokens
   *    - type1: {}
   *      - tokens: [] - SLP token Type 1 tokens.
   *      - mintBatons: [] - SLP token Type 1 mint batons.
   *    - nft: {}
   *      - tokens: [] - NFT tokens
   *      - groupTokens: [] - NFT Group tokens, used to create NFT tokens.
   *      - groupMintBatons: [] - Minting baton to create more NFT Group tokens.
   *
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "address": "bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj" }' localhost:5001/bch/utxos
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     [
   *        {
   *           "addresses": ["bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj"],
   *           "bchUtxos":[
   *              {
   *                 "height":631219,
   *                 "tx_hash":"ae2daa01c8172545b5edd205ea438706bcb74e63d4084a26b9ff2a46d46dc97f",
   *                 "tx_pos":0,
   *                 "value":1000,
   *                 "txid":"ae2daa01c8172545b5edd205ea438706bcb74e63d4084a26b9ff2a46d46dc97f",
   *                 "vout":0,
   *                 "isValid":false
   *              }
   *           ],
   *           "nullUtxos":[
   *
   *           ],
   *           "slpUtxos":{
   *              "type1":{
   *                 "mintBatons":[
   *
   *                 ],
   *                 "tokens":[
   *
   *                 ]
   *              },
   *              "nft":{
   *                 "groupMintBatons":[
   *
   *                 ],
   *                 "groupTokens":[
   *
   *                 ],
   *                 "tokens":[
   *
   *                 ]
   *              }
   *           }
   *        }
   *     ]
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async utxosBulk (ctx) {
    try {
      const addrs = ctx.request.body.addresses
      // console.log('address: ', address)

      const utxos = await this.adapters.bch.getUtxosBulk(addrs)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      ctx.body = utxos
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /bch/broadcast Broadcast
   * @apiName Broadcast
   * @apiGroup REST BCH
   * @apiDescription Broadcast a transaction to the BCH network.
   * The transaction should be encoded as a hexidecimal string.
   *
   * This endpoint will return a transaction id
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "hex": "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0704ffff001d0104ffffffff0100f2052a0100000043410496b538e853519c726a2c91e61ec11600ae1390813a627c66fb8be7947be63c52da7589379515d4e0a604f8141781e62294721166bf621e73a82cbf2342c858eeac00000000" }' localhost:5001/bch/broadcast
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     "951299775f68a599b95239bfc385423f87a33e11747c299a22ef9dcf3d1557ec"
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async broadcast (ctx) {
    try {
      const hex = ctx.request.body.hex

      const txid = await this.adapters.bch.broadcast(hex)
      // console.log(`txid: ${JSON.stringify(txid, null, 2)}`)

      ctx.body = txid
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
   *
   * @api {post} /bch/txHistory TX History
   * @apiName TX History
   * @apiGroup REST BCH
   * @apiDescription This endpoint wraps the bchjs.Electrumx.transactions([]) function.
   * It returns the transaction history for an address. This list of TXIDs is
   * sorted and paginated.
   *
   * There are three possible inputs:
   * - address: (required) the address to query for a transaction history
   * - sortOrder: (optional) will sort results in 'DECENDING' (default) or 'ASCENDING' order.
   * - page: (optional) will return a 'page' of 100 results. Default is 0
   *
   *  Given the 'addresses' property returns an array of objects
   *  with the following properties
   *
   *  - success : - Petition status
   *  - transactions : [] - Transaction of the provided address
   *    - transactions: [] - Transaction details
   *      - height : - Reference to the blockchain size
   *      - tx_hash: "" - Transaction hash
   *    - address : "" - Address associated to the transactions
   *
   *  Note: For a single address pass the 'addresses' of string type
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "address": "bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj" }' localhost:5001/bch/txHistory
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "success":true,
   *        "transactions":[
   *           {
   *              "transactions":[
   *                 {
   *                    "height":631219,
   *                    "tx_hash":"ae2daa01c8172545b5edd205ea438706bcb74e63d4084a26b9ff2a46d46dc97f"
   *                 }
   *              ],
   *              "address":"bitcoincash:qrl2nlsaayk6ekxn80pq0ks32dya8xfclyktem2mqj"
   *           }
   *        ]
   *     }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async txHistory (ctx) {
    try {
      // console.log('transactions REST API handler called.')
      // console.log(`body: ${JSON.stringify(ctx.request.body, null, 2)}`)

      const addr = ctx.request.body.address
      const sortOrder = ctx.request.body.sortOrder
      const page = ctx.request.body.page

      const data = await this.adapters.bch.getTransactions(
        addr,
        sortOrder,
        page
      )
      // console.log(`data: ${JSON.stringify(data, null, 2)}`)

      ctx.body = data
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /bch/txData TX Data
   * @apiName txData
   * @apiGroup REST BCH
   * @apiDescription Get expanded transaction data for an array of transaction
   * IDs. Each call is limited to 20 TXIDs or less.
   *
   * Get data about specific transactions.
   * Given an array of transaction IDs this endpoint will return an array of objects
   * with the following properties
   *
   * - txid: "" - Transaction ID
   * - hash: "" - Transaction hash
   * - version: - Version number
   * - size: - Transaction size
   * - locktime: -
   * - vin: [] - Transaction inputs
   * - vout: [] - Transaction outputs
   * - hex: "" - hexadecimal script
   * - blockhash: "" - Reference to the block register
   * - confirmations : "" - Transaction confirmations
   * - time: - Execution time
   * - blocktime: - Execution time
   * - isValidSLPTx: - Determines if the transaction was under SLP
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "txids": ["01517ff1587fa5ffe6f5eb91c99cf3f2d22330cd7ee847e928ce90ca95bf781b"] }' localhost:5001/bch/transaction
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   * [{
   *    "txid":"01517ff1587fa5ffe6f5eb91c99cf3f2d22330cd7ee847e928ce90ca95bf781b",
   *    "hash":"01517ff1587fa5ffe6f5eb91c99cf3f2d22330cd7ee847e928ce90ca95bf781b",
   *    "version":1,
   *    "size":272,
   *    "locktime":0,
   *    "vin":[
   *       {
   *          "txid":"4deef6de4b973706cd6e8fc8105a41a84be349e4e9717225ee5e7c63538e95e8",
   *          "vout":1,
   *          "scriptSig":{
   *             "asm":"3045022100fce6ef975fa7ec66e0ce0c51d839fd8f56510897252c0b238e7265974bc7c07202200d1d1429154e6775eecdc2829965650bc3ca714a86088d705bd58f8c034f2496[ALL|FORKID] 0467ff2df20f28bc62ad188525868f41d461f7dab3c1e500314cdb5218e5637bfd0f9c02eb5b3f383f698d28ff13547eaf05dd9216130861dd0216824e9d7337e3",
   *             "hex":"483045022100fce6ef975fa7ec66e0ce0c51d839fd8f56510897252c0b238e7265974bc7c07202200d1d1429154e6775eecdc2829965650bc3ca714a86088d705bd58f8c034f249641410467ff2df20f28bc62ad188525868f41d461f7dab3c1e500314cdb5218e5637bfd0f9c02eb5b3f383f698d28ff13547eaf05dd9216130861dd0216824e9d7337e3"
   *          },
   *          "sequence":4294967295,
   *          "address":"bitcoincash:qqrxa0h9jqnc7v4wmj9ysetsp3y7w9l36u8gnnjulq",
   *          "value":0.00001824
   *       }
   *    ],
   *    "vout":[
   *       {
   *          "value":0,
   *          "n":0,
   *          "scriptPubKey":{
   *             "asm":"OP_RETURN -385055325 46226800369048b83cea897639bb39273c8e4b883bd8c2a435bbe7a237cc433a",
   *             "hex":"6a045d7af3962046226800369048b83cea897639bb39273c8e4b883bd8c2a435bbe7a237cc433a",
   *             "type":"nulldata"
   *          }
   *       },
   *       {
   *          "value":0.0000155,
   *          "n":1,
   *          "scriptPubKey":{
   *             "asm":"OP_DUP OP_HASH160 066ebee590278f32aedc8a4865700c49e717f1d7 OP_EQUALVERIFY OP_CHECKSIG",
   *             "hex":"76a914066ebee590278f32aedc8a4865700c49e717f1d788ac",
   *             "reqSigs":1,
   *             "type":"pubkeyhash",
   *             "addresses":[
   *                "bitcoincash:qqrxa0h9jqnc7v4wmj9ysetsp3y7w9l36u8gnnjulq"
   *             ]
   *          }
   *       }
   *    ],
   *    "hex":"0100000001e8958e53637c5eee257271e9e449e34ba8415a10c88f6ecd0637974bdef6ee4d010000008b483045022100fce6ef975fa7ec66e0ce0c51d839fd8f56510897252c0b238e7265974bc7c07202200d1d1429154e6775eecdc2829965650bc3ca714a86088d705bd58f8c034f249641410467ff2df20f28bc62ad188525868f41d461f7dab3c1e500314cdb5218e5637bfd0f9c02eb5b3f383f698d28ff13547eaf05dd9216130861dd0216824e9d7337e3ffffffff020000000000000000276a045d7af3962046226800369048b83cea897639bb39273c8e4b883bd8c2a435bbe7a237cc433a0e060000000000001976a914066ebee590278f32aedc8a4865700c49e717f1d788ac00000000",
   *    "blockhash":"0000000000000000008e8d83cba6d45a9314bc2ef4538d4e0577c6bed8593536",
   *    "confirmations":97988,
   *    "time":1568338904,
   *    "blocktime":1568338904,
   *    "isValidSLPTx":false
   * }]
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async txData (ctx) {
    try {
      console.log(
        `txData called with this body data: ${JSON.stringify(
          ctx.request.body,
          null,
          2
        )}`
      )

      const txids = ctx.request.body.txids

      const data = await this.adapters.bch.getTransaction(txids)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      ctx.body = data
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {REST} /bch/pubkey PubKey
   * @apiPermission public
   * @apiName PubKey
   * @apiGroup REST BCH
   * @apiDescription Get the public key from an address.
   * Given an address the endpoint will return an object with the
   * following properties
   *
   *  - jsonrpc: "" - jsonrpc version
   *  - id: "" - jsonrpc id
   *  - result: {} - Result of the petition with the RPC information
   *      - success: - Request status
   *      - publickey: - Address public key
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "txid": "01517ff1587fa5ffe6f5eb91c99cf3f2d22330cd7ee847e928ce90ca95bf781b" }' localhost:5001/bch/pubkey
   *
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "jsonrpc":"2.0",
   *     "id":"555",
   *     "result":{
   *        "method":"bch",
   *        "reciever":"QmU86vLVbUY1UhziKB6rak7GPKRA2QHWvzNm2AjEvXNsT6",
   *        "value":{
   *          "success": true,
   *          "status": 200,
   *          "endpoint": "pubkey",
   *          "pubkey": {
   *            "success": true,
   *            "publicKey": "033f267fec0f7eb2b27f8c2e3052b3d03b09d36b47de4082ffb638ffb334ef0eee"
   *          }
   *        }
   *     }
   *  }
   */
  async pubKey (ctx) {
    try {
      const address = ctx.request.body.address

      const data = await this.adapters.bch.getPubKey(address)
      console.log(`pubkey data: ${JSON.stringify(data, null, 2)}`)

      ctx.body = data
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {REST} /bch/utxoIsValid utxoIsValid
   * @apiPermission public
   * @apiName utxoIsValid
   * @apiGroup REST BCH
   * @apiDescription Verify if UTXO is valid
   * Given a UTXO object (txid and vout), a full node is queried to verify that
   * the UTXO still exists in the mempool (true), or if it has been spent (false).
   *
   *  - jsonrpc: "" - jsonrpc version
   *  - id: "" - jsonrpc id
   *  - result: {} - Result of the petition with the RPC information
   *      - success: - Request status
   *      - isValid: - Boolean: true or false
   *
   * @apiExample Example usage:
   * {"jsonrpc":"2.0","id":"555","method":"bch","params":{ "endpoint": "utxoIsValid", "utxo": {"tx_hash": "17754221b29f189532d4fc2ae89fb467ad2dede30fdec4854eb2129b3ba90d7a", "tx_pos": 0}}}
   *
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "jsonrpc":"2.0",
   *     "id":"555",
   *     "result":{
   *        "method":"bch",
   *        "reciever":"QmU86vLVbUY1UhziKB6rak7GPKRA2QHWvzNm2AjEvXNsT6",
   *        "value":{
   *          "success": true,
   *          "status": 200,
   *          "endpoint": "utxoIsValid",
   *          "isValid": true
   *        }
   *     }
   *
   *  }
   */
  async utxoIsValid (ctx) {
    try {
      const utxo = ctx.request.body.utxo

      const data = await this.adapters.bch.utxoIsValid(utxo)
      // console.log(`utxoIsValid data: ${JSON.stringify(data, null, 2)}`)

      ctx.body = data
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
    * @api {REST} /bch getTokenData
    * @apiPermission public
    * @apiName getTokenData
    * @apiGroup REST BCH
    * @apiDescription Get data associated with a token
    *
    * Given a token ID, this endpoint will retrieve the IPFS CIDs associated with
    * the tokens mutable and immutable data. This is extension of the PS002
    * specification for mutable data for tokens:
    * https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps002-slp-mutable-data.md
    *
    *
    * @apiExample Example usage:
    * curl -H "Content-Type: application/json" -X POST -d '{ "tokenId": "43eddfb11c9941edffb8c8815574bb0a43969a7b1de39ad14cd043eaa24fd38d", "withTxHistory": true }' https://bc01-ca-bch-consumer.fullstackcash.nl/bch/getTokenData
    */
  async getTokenData (ctx) {
    try {
      const tokenId = ctx.request.body.tokenId
      const withTxHistory = !!ctx.request.body.withTxHistory

      const data = await this.adapters.bch.getTokenData(tokenId, withTxHistory)
      console.log(`getTokenData data: ${JSON.stringify(data, null, 2)}`)

      ctx.body = data
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
    * @api {REST} /bch getTokenData2
    * @apiPermission public
    * @apiName getTokenData2
    * @apiGroup REST BCH
    * @apiDescription Get token icon and other media
    *
    * Get the icon for a token, given it's token ID.
    * This function expects a string input of a token ID property.
    * This function returns an object with a tokenIcon property that contains
    * the URL to the icon.
    *
    * The output object always have these properties:
    * - tokenIcon: A url to the token icon, if it exists.
    * - tokenStats: Data about the token from psf-slp-indexer.
    * - optimizedTokenIcon: An alternative, potentially more optimal, url to the token icon, if it exists.
    * - iconRepoCompatible: true if the token icon is available via token.bch.sx
    * - ps002Compatible: true if the token icon is compatible with PS007 specification.
    *
    * @apiExample Example usage:
    * curl -H "Content-Type: application/json" -X POST -d '{ "tokenId": "43eddfb11c9941edffb8c8815574bb0a43969a7b1de39ad14cd043eaa24fd38d" }' https://bc01-ca-bch-consumer.fullstackcash.nl/bch/getTokenData2
    * curl -H "Content-Type: application/json" -X POST -d '{ "tokenId": "43eddfb11c9941edffb8c8815574bb0a43969a7b1de39ad14cd043eaa24fd38d", "updateCache": true }' https://bc01-ca-bch-consumer.fullstackcash.nl/bch/getTokenData2
    */
  async getTokenData2 (ctx) {
    try {
      const tokenId = ctx.request.body.tokenId
      const updateCache = ctx.request.body.updateCache
      console.log('getTokenData2() updateCache: ', updateCache)

      const data = await this.adapters.bch.getTokenData2(tokenId, updateCache)
      console.log(`getTokenData2 data: ${JSON.stringify(data, null, 2)}`)

      ctx.body = data
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

// module.exports = BchRESTControllerLib
export default BchRESTControllerLib
