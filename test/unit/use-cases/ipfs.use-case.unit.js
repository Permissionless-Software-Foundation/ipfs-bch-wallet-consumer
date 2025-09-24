/*
  Unit tests for the ipfs-use-cases.js file.
*/

// Public npm libraries
import { assert } from 'chai'

import sinon from 'sinon'

// Local support libraries
// const testUtils = require('../../utils/test-utils')

// Unit under test (uut)
import UseCases from '../../../src/use-cases/ipfs-use-cases.js'

import adapters from '../mocks/adapters/index.js'
describe('#ipfs-use-cases', () => {
  let uut
  let sandbox

  before(async () => {
    // Delete all previous users in the database.
    // await testUtils.deleteAllUsers()
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    uut = new UseCases({ adapters })
    uut.adapters.ipfs.ipfsCoordAdapter = {
      state: {
        selectedIpfsFileProvider: 'provider'
      }
    }
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new UseCases()

        assert.fail('Unexpected code path')

        // This is here to prevent the linter from complaining.
        assert.isOk(uut)
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating IPFS Use Cases library.'
        )
      }
    })
  })

  describe('#downloadCid', () => {
    it('should download a file from IPFS', async () => {
      sandbox.stub(uut, 'getCidMetadata').resolves('file.txt')

      const result = await uut.downloadCid({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })

      assert.property(result, 'filename')
      assert.property(result, 'readStream')
    })
    it('should handle directory-based CIDs', async () => {
      sandbox.stub(uut, 'getCidMetadata').resolves('file.txt')
      sandbox.stub(uut.adapters.ipfs.ipfs.fs, 'ls').callsFake(async function * () {
        yield { path: 'dir1/test.txt', cid: 'QmS4ghgMgfFvqPjB4WKXHaN15ZyT4K4JYZxY5X5x5x5x5' }
      })
      const result = await uut.downloadCid({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })

      assert.property(result, 'filename')
      assert.property(result, 'readStream')
    })
    it('should throw an error if cid is not provided ', async () => {
      try {
        await uut.downloadCid({})
      } catch (error) {
        assert.include(error.message, 'CID is undefined')
      }
    })
  })
  describe('#getWritePrice', () => {
    it('should get price', async () => {
      const result = await uut.getWritePrice()
      assert.isNumber(result)
    })
    it('should handle undefined psffpp instance', async () => {
      uut.psffpp = null
      const result = await uut.getWritePrice()
      assert.isNumber(result)
    })
    it('should re-instantiate psffpp instance', async () => {
      const psffppMock = {}
      uut.psffpp = psffppMock
      const lastWritePriceUpdate = new Date()
      lastWritePriceUpdate.setHours(lastWritePriceUpdate.getHours() - 10)
      uut.lastWritePriceUpdate = lastWritePriceUpdate.getTime()
      const result = await uut.getWritePrice()
      assert.isNumber(result)
      assert.notEqual(uut.lastWritePriceUpdate, lastWritePriceUpdate.getTime())
      assert.notEqual(uut.psffpp, psffppMock)
    })

    it('should handle error ', async () => {
      try {
        uut.lastWritePriceUpdate = new Date().getTime()
        uut.psffpp = {
          getMcWritePrice: () => {
            throw new Error('test error')
          }
        }
        await uut.getWritePrice()
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
  })
  describe('#getCidMetadata', () => {
    it('should get cid metadata', async () => {
      sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ success: true, fileMetadata: { dataPinned: true, filename: 'test.json' } })
      const result = await uut.getCidMetadata({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
      assert.isString(result)
      assert.equal(result, 'test.json')
    })

    it('should handle error ', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').throws(new Error('test error'))
        await uut.getCidMetadata({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should handle non-success response from getFileMetadata', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ success: false, message: 'test error' })
        await uut.getCidMetadata({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
  })
  describe('#cid2json', () => {
    it('should get cid2json', async () => {
      uut.adapters.ipfs.ipfsCoordAdapter = {
        state: {
          selectedIpfsFileProvider: 'provider'
        }
      }
      sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ fileMetadata: { dataPinned: true, filename: 'test.json' } })
      sandbox.stub(uut.adapters.ipfs.ipfs.fs, 'ls').callsFake(function * () {
        yield { name: 'test.json' }
      })
      sandbox.stub(JSON, 'parse').returns(true)
      const result = await uut.cid2json({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
      assert.isObject(result)
      assert.property(result, 'success')
      assert.property(result, 'json')
    })

    it('should throw error if selectedIpfsFileProvider is not defined', async () => {
      try {
        uut.adapters.ipfs.ipfsCoordAdapter = {
          state: {
            selectedIpfsFileProvider: null
          }
        }
        await uut.cid2json({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'No IPFS File Provider Service is available yet. Try again in a few seconds')
      }
    })
    it('should throw error if file metadata cant be fetched', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ success: false })
        await uut.cid2json({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not communicate with instance of ipfs-file-pin-service')
      }
    })
    it('should throw error if cid is not pinned', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ success: true, fileMetadata: { dataPinned: false } })
        await uut.cid2json({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'has not been pinned by ipfs-file-pin-service instance')
      }
    })
    it('should throw error if filename has no .json extension', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ success: true, fileMetadata: { dataPinned: true, filename: 'test' } })
        await uut.cid2json({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'does not resolve to a JSON file')
      }
    })
    it('should handle error if file cant be retrieved', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ fileMetadata: { dataPinned: true, filename: 'test.json' } })
        sandbox.stub(uut.adapters.ipfs.ipfs.fs, 'cat').throws(new Error('test error'))
        sandbox.stub(uut.adapters.ipfs.ipfs.fs, 'ls').callsFake(function * () {
          yield { name: 'test.json' }
        })
        await uut.cid2json({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should handle error if cid is a directory', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ fileMetadata: { dataPinned: true, filename: 'test.json' } })
        sandbox.stub(uut.adapters.ipfs.ipfs.fs, 'cat')
          .onCall(0).throws(new Error('test error'))
          .onCall(1).callsFake(function * () {
            yield { name: 'test.json' }
          })
        sandbox.stub(uut.adapters.ipfs.ipfs.fs, 'ls').callsFake(function * () {
          yield { name: 'test/directory/' }
        })
        await uut.cid2json({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
      } catch (error) {
        assert.include(error.message, 'file does not resolve to a valid JSON file')
      }
    })
    it('should get content from cid/name.json format', async () => {
      sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ fileMetadata: { dataPinned: true, filename: 'test.json' } })
      sandbox.stub(uut.adapters.ipfs.ipfs.fs, 'cat')
        .onCall(0).throws(new Error('test error'))
        .onCall(1).callsFake(function * () {
          yield Buffer.from('{"test": "test"}')
        })
      sandbox.stub(uut.adapters.ipfs.ipfs.fs, 'ls').callsFake(function * () {
        yield { name: 'test/directory/test.json' }
      })

      const result = await uut.cid2json({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
      assert.isObject(result)
      assert.property(result, 'success')
      assert.property(result, 'json')
    })
    it('should handle if content cant be parsed', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'getFileMetadata').resolves({ fileMetadata: { dataPinned: true, filename: 'test.json' } })
        sandbox.stub(uut.adapters.ipfs.ipfs.fs, 'ls').callsFake(function * () {
          yield { name: 'test.json' }
        })
        sandbox.stub(JSON, 'parse').throws(new Error())

        await uut.cid2json({ cid: 'bafybeib2rphswe7clvclverw7xi7nejkpkh4mdfcurdmcgw7wcup7za6wy' })
      } catch (error) {
        assert.include(error.message, 'not resolve to a valid JSON object')
      }
    })
  })
  describe('#pinClaim', () => {
    it('should process pinClaim', async () => {
      const result = await uut.pinClaim()
      assert.isObject(result)
      assert.property(result, 'success')
      assert.property(result, 'message')
    })

    it('should handle error ', async () => {
      try {
        sandbox.stub(uut.adapters.ipfsFiles, 'pinClaim').throws(new Error('test error'))
        await uut.pinClaim()
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
  })
})
