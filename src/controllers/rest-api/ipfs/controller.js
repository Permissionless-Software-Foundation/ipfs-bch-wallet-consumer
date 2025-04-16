/*
  REST API Controller library for the /ipfs route
*/

// Global npm libraries
import mime from 'mime-types'

// Local libraries
import wlogger from '../../../adapters/wlogger.js'

class IpfsRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /ipfs REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /ipfs REST Controller.'
      )
    }

    // Encapsulate dependencies
    // this.UserModel = this.adapters.localdb.Users
    // this.userUseCases = this.useCases.user

    // Bind 'this' object to all subfunctions
    this.getStatus = this.getStatus.bind(this)
    this.getPeers = this.getPeers.bind(this)
    this.getRelays = this.getRelays.bind(this)
    this.handleError = this.handleError.bind(this)
    this.connect = this.connect.bind(this)
    this.getThisNode = this.getThisNode.bind(this)
    this.viewFile = this.viewFile.bind(this)
    this.getService = this.getService.bind(this)
    this.getFileInfo = this.getFileInfo.bind(this)
    this.getPins = this.getPins.bind(this)
    this.cid2json = this.cid2json.bind(this)
    this.downloadFile = this.downloadFile.bind(this)
    this.pinClaim = this.pinClaim.bind(this)
  }

  /**
   * @api {get} /ipfs Get status on IPFS infrastructure
   * @apiPermission public
   * @apiName GetIpfsStatus
   * @apiGroup REST IPFS
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/ipfs
   *
   */
  async getStatus (ctx) {
    try {
      const status = await this.adapters.ipfs.getStatus()

      ctx.body = { status }
    } catch (err) {
      wlogger.error('Error in ipfs/controller.js/getStatus(): ')
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  // Return information on IPFS peers this node is connected to.
  async getPeers (ctx) {
    try {
      const showAll = ctx.request.body.showAll

      const peers = await this.adapters.ipfs.getPeers(showAll)

      ctx.body = { peers }
    } catch (err) {
      wlogger.error('Error in ipfs/controller.js/getPeers(): ')
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  // Get data about the known Circuit Relays. Hydrate with data from peers list.
  async getRelays (ctx) {
    try {
      const relays = await this.adapters.ipfs.getRelays()

      ctx.body = { relays }
    } catch (err) {
      wlogger.error('Error in ipfs/controller.js/getRelays(): ')
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  async connect (ctx) {
    try {
      const multiaddr = ctx.request.body.multiaddr
      const getDetails = ctx.request.body.getDetails

      // console.log('this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.adapters.ipfs: ', this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.adapters.ipfs)
      const result = await this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.adapters.ipfs.connectToPeer({ multiaddr, getDetails })
      // console.log('result: ', result)

      ctx.body = result
    } catch (err) {
      wlogger.error('Error in ipfs/controller.js/connect():', err)
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /ipfs/node Get a copy of the thisNode object from helia-coord
   * @apiPermission public
   * @apiName GetThisNode
   * @apiGroup REST IPFS
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/ipfs/node
   *
   */
  async getThisNode (ctx) {
    try {
      const thisNode = this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode

      ctx.body = { thisNode }
    } catch (err) {
      wlogger.error('Error in ipfs/controller.js/getThisNode(): ')
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /ipfs/view/:cid Retrieve and display a file via its IPFS CID
   * @apiPermission public
   * @apiName GetCidView
   * @apiGroup REST IPFS
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/ipfs/view/bafkreieaqtdhfywyddomswogynzymukosqqgqo7lkt5lch2zwfnc55m6om
   *
   */
  async viewFile (ctx) {
    try {
      const { cid } = ctx.params

      // const file = await this.adapters.ipfs.ipfs.blockstore.get(cid)
      // return file

      // const cid = ctx.params.cid

      const { filename, readStream } = await this.useCases.ipfs.downloadCid({ cid })

      // ctx.body = ctx.req.pipe(readStream)

      // Lookup the mime type from the filename.
      const contentType = mime.lookup(filename)

      ctx.set('Content-Type', contentType)
      ctx.set(
        'Content-Disposition',
        // 'inline; filename="' + filename + '"'
        `inline; filename="${filename}"`
      )
      ctx.body = readStream
    } catch (err) {
      console.log('Error in ipfs/controller.js/viewFile(): ', err)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /ipfs/download/:cid Download a file via its IPFS CID
   * @apiPermission public
   * @apiName GetCidDownload
   * @apiGroup REST IPFS
   * @apiDescription Download a file via its IPFS CID. Returns a readable stream.
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/ipfs/download/bafkreieaqtdhfywyddomswogynzymukosqqgqo7lkt5lch2zwfnc55m6om
   */
  async downloadFile (ctx) {
    try {
      const { cid } = ctx.params

      const { readStream } = await this.useCases.ipfs.downloadCid({ cid })

      ctx.body = readStream
    } catch (err) {
      console.log('Error in ipfs/controller.js/downloadFile(): ', err)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /ipfs/service Get the IPFS ID for the File Pin service
   * @apiPermission public
   * @apiName GetService
   * @apiGroup REST IPFS
   * @apiDescription Get the IPFS ID for the ipfs-file-pin-service node that
   * this app is using to retrieve file data from.
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5015/ipfs/service
   *
   */
  async getService (ctx) {
    try {
      const selectedIpfsFileProvider = this.adapters.ipfs.ipfsCoordAdapter.state.selectedIpfsFileProvider

      ctx.body = {
        success: true,
        selectedIpfsFileProvider
      }
    } catch (err) {
      // wlogger.error('Error in ipfs/controller.js/getService(): ', err)
      console.log('Error in ipfs/controller.js/getService(): ', err)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /ipfs/file-info/:cid Get file pin info about a CID
   * @apiPermission public
   * @apiName GetFileInfo
   * @apiGroup REST IPFS
   * @apiDescription Get file metadata and pin status information give a CID.
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5015/ipfs/file-info/bafkreieaqtdhfywyddomswogynzymukosqqgqo7lkt5lch2zwfnc55m6om
   *
   */
  async getFileInfo (ctx) {
    try {
      const { cid } = ctx.params

      const ipfsFiles = this.adapters.ipfsFiles

      const metadata = await ipfsFiles.getFileMetadata({ cid })
      console.log('getCidMetadata() metadata: ', metadata)

      ctx.body = metadata
    } catch (err) {
      console.log('Error in ipfs/controller.js/getFileInfo(): ', err)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /ipfs/pins Get info on latest 20 pinned files
   * @apiPermission public
   * @apiName GetPins
   * @apiGroup REST IPFS
   * @apiDescription Returns an array of the latest 20 pinned files.
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5015/ipfs/pins
   *
   */
  async getPins (ctx) {
    try {
      const { page } = ctx.params

      const ipfsFiles = this.adapters.ipfsFiles

      const pinData = await ipfsFiles.getPins({ page })
      console.log('getPins() pinData: ', pinData)

      ctx.body = pinData
    } catch (err) {
      console.log('Error in ipfs/controller.js/getPins(): ', err)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /ipfs/cid2json/:cid Given a CID, retrieve a JSON object
   * @apiPermission public
   * @apiName GetCid2Json
   * @apiGroup REST IPFS
   * @apiDescription Given a CID, retrieve a JSON object.
   * If the CID does not resolves to a JSON file, then an error is thrown.
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5015/ipfs/cid2json/bafkreigbgrvpagnmrqz2vhofifrqobigsxkdvnvikf5iqrkrbwrzirazhm
   *
   */
  async cid2json (ctx) {
    try {
      const { cid } = ctx.params

      const json = await this.useCases.ipfs.cid2json({ cid })

      ctx.body = json
    } catch (err) {
      console.log('Error in ipfs/controller.js/cid2json(): ', err.message)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /ipfs/pin-claim Process pin claim.
   * @apiPermission public
   * @apiName PinClaim
   * @apiGroup REST IPFS
   * @apiDescription Process pin claim.
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "proofOfBurnTxid": "be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c", "cid": "bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq", "claimTxid": "c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2", "filename": "mutable-67ccefcca67097473e78ca10.json", "address": "bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr" }' http://localhost:5001/ipfs/pin-claim   *
   */
  async pinClaim (ctx) {
    try {
      const body = ctx.request.body

      const result = await this.useCases.ipfs.pinClaim(body)

      ctx.body = result
    } catch (err) {
      console.log('Error in ipfs/controller.js/cid2json(): ', err.message)
      this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // console.log('handleError() err.status: ', err.status)
    // console.log('handleError() err.message: ', err.message)

    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // console.log(`handleError() err.message: ${err.message}`)
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

// module.exports = IpfsRESTControllerLib
export default IpfsRESTControllerLib
