/*
  Use cases for working with IPFS.
*/

// Global npm libraries
// import Wallet from 'minimal-slp-wallet'
// import { CID } from 'multiformats'
// import RetryQueue from '@chris.troutner/retry-queue'
// import { exporter } from 'ipfs-unixfs-exporter'
import { Duplex } from 'stream'
import PSFFPP from 'psffpp'

// Local libraries
// import PinEntity from '../entities/pin.js'
// import config from '../../config/index.js'

// const PSF_TOKEN_ID = '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'

class IpfsUseCases {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating IPFS Use Cases library.'
      )
    }

    // Encapsulate dependencies
    this.psffpp = null // placeholder

    // Bind 'this' object to all class subfunctions.
    this.downloadCid = this.downloadCid.bind(this)
    // this.downloadCid2 = this.downloadCid2.bind(this)
    this.getWritePrice = this.getWritePrice.bind(this)

    // State
    this.lastWritePriceUpdate = null // Used to periodically update write price.
  }

  // Download a pinned file, given its CID.
  // Returns a readable stream.
  async downloadCid (inObj = {}) {
    try {
      const { cid } = inObj

      if (!cid) throw new Error('CID is undefined')

      // const Pins = this.adapters.localdb.Pins
      // let existingModel = await Pins.find({ cid })
      // existingModel = existingModel[0]
      // console.log('existingModel: ', existingModel)

      // if (!existingModel) {
      //   throw new Error(`Database model for CID ${cid} does not exist.`)
      // }
      //
      // if (!existingModel.dataPinned) {
      //   throw new Error('File has not been pinned. Not available.')
      // }

      const filename = await this.getCidMetadata({ cid })

      const helia = this.adapters.ipfs.ipfs

      // Convert the file to a Buffer.
      const fileChunks = []
      for await (const chunk of helia.fs.cat(cid)) {
        fileChunks.push(chunk)
      }
      const fileBuf = Buffer.concat(fileChunks)

      // Convert the Buffer into a readable stream
      const bufferToStream = (myBuffer) => {
        const tmp = new Duplex()
        tmp.push(myBuffer)
        tmp.push(null)
        return tmp
      }
      const readStream = bufferToStream(fileBuf)

      // const filename = 'test.jpg'

      return { filename, readStream }
    } catch (err) {
      console.error('Error in use-cases/ipfs.js/dowloadCid()')
      throw err
    }
  }

  // Get the price (in PSF tokens) to pin 1MB to the PSFFPP network. This price
  // is set on-chain by the PSF Minting Council. PSFoundation.cash
  async getWritePrice (inObj = {}) {
    try {
      const wallet = this.adapters.wallet.bchWallet
      // console.log('getWritePrice() wallet: ', wallet)

      // Instantiate the psffpp library if it hasn't already been.
      // Dev Note: Important to only instantiate once, since the write price
      // is cached by the psffpp library. Instantiating only once improves
      // performance of price lookup.
      if (!this.psffpp) {
        this.psffpp = new PSFFPP({ wallet })

        const now = new Date()
        this.lastWritePriceUpdate = now.getTime()
      }

      // Periodically re-validate the write-price (by re-instantiating the
      // PSFFPP library) in case it's changed.
      const now = new Date()
      const sixHours = now.getTime() * 1000*60*60*6
      if(this.lastWritePriceUpdate + sixHours < now.getTime()) {
        this.psffpp = new PSFFPP({ wallet })

        this.lastWritePriceUpdate = now.getTime()
      }

      const writePrice = await this.psffpp.getMcWritePrice()

      return writePrice
    } catch (err) {
      console.error('Error in use-cases/ipfs-use-cases.js/getWritePrice()')
      throw err
    }
  }

  // Given a CID, this function will retrieve file metadata from the
  // ipfs-file-pin-service, using the IPFS JSON-RPC. This metadata includes
  // the filename, which can be used to infer mime-type, so that it can be
  // delivered to a web browser.
  async getCidMetadata (inObj = {}) {
    try {
      const { cid } = inObj

      const ipfsFiles = this.adapters.ipfsFiles

      const metadata = await ipfsFiles.getFileMetadata({ cid })
      console.log('getCidMetadata() metadata: ', metadata)

      if (metadata.success === false) {
        throw new Error(metadata.message)
      }

      const filename = metadata.fileMetadata.filename

      return filename
    } catch (err) {
      console.error('Error in getCidMetadata(): ', err)
      throw err
    }
  }

  // async downloadCid2 (inObj = {}) {
  //   try {
  //     const { cid } = inObj
  //
  //     // console.log(`downloadFile() retrieving this CID: ${cid}, with fileName: ${fileName}, and path: ${path}`)
  //
  //     const blockstore = this.adapters.ipfs.ipfs.blockstore
  //     const entry = await this.exporter(cid, blockstore)
  //
  //     console.info(entry.cid) // Qmqux
  //     console.log('entry: ', entry)
  //     // console.info(entry.unixfs.fileSize()) // 4
  //
  //     // const filePath = `${path}/${fileName}`
  //     // console.log(`filePath: ${filePath}`)
  //     // const writableStream = this.fs.createWriteStream(filePath)
  //     //
  //     // writableStream.on('error', this.writeStreamError)
  //     //
  //     // writableStream.on('finish', this.writeStreamFinished)
  //     //
  //
  //     const fileChunks = []
  //     for await (const buf of entry.content()) {
  //       fileChunks.push(buf)
  //     }
  //     const fileBuf = Buffer.concat(fileChunks)
  //
  //     //
  //     // writableStream.end()
  //
  //     // Convert the Buffer into a readable stream
  //     const bufferToStream = (myBuffer) => {
  //       const tmp = new Duplex()
  //       tmp.push(myBuffer)
  //       tmp.push(null)
  //       return tmp
  //     }
  //     const readStream = bufferToStream(fileBuf)
  //
  //     const filename = 'test.jpg'
  //
  //     return { filename, readStream }
  //
  //     // return { cid }
  //   } catch (err) {
  //     console.error('Error in ipfs-use-cases.js/downloadCid()')
  //     throw err
  //   }
  // }
}

export default IpfsUseCases
