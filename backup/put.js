'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const hash = require('@moooji/hash');
const sinon = require('sinon');
const storage = require('../index');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Put', () => {
  let s3 = null;
  let testStorage = null;
  const buffer = new Buffer('data');
  const path = 'folder/image.jpg';
  const mimeType = 'image/jpeg';
  const bucket = 'bucket';
  const checksum = hash(buffer, 'base64');
  const expectedParams = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: bucket,
    ContentMD5: checksum.base64,
    ContentType: mimeType,
    Key: path,
  };

  before(() => {
    s3 = sinon.mock();
    s3.upload = sinon.stub().yieldsAsync(null, { ETag: '123', Location: 'loc' });

    testStorage = storage.create({
      s3,
      bucket,
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
    });
  });

  after(() => {
    s3 = null;
    testStorage = null;
  });

  it('should be rejected with an TypeError if buffer is invalid', () => {
    return expect(testStorage.put(123, path, mimeType))
      .to.be.rejectedWith(testStorage.TypeError)
      .then(() => sinon.assert.notCalled(s3.upload));
  });

  it('should be rejected with an TypeError if path is invalid', () => {
    return expect(testStorage.put(buffer, 123, mimeType))
      .to.be.rejectedWith(testStorage.TypeError)
      .then(() => sinon.assert.notCalled(s3.upload));
  });

  it('should be rejected with an TypeError if MIME type is invalid', () => {
    return expect(testStorage.put(buffer, path, 123))
      .to.be.rejectedWith(testStorage.TypeError)
      .then(() => sinon.assert.notCalled(s3.upload));
  });

  it('should be rejected with an StorageError if eTags do not match', () => {
    const location = 'https://s3.com/1.jpg';
    s3.upload = sinon.stub().yieldsAsync(null, { ETag: 'abc', Location: location });

    return expect(testStorage.put(buffer, path, mimeType))
      .to.be.rejectedWith(testStorage.StorageError)
      .then(() => {
        sinon.assert.calledOnce(s3.upload);
        sinon.assert.calledWith(s3.upload, expectedParams);
      });
  });

  it('should be rejected with an StorageError if invalid location is returned', () => {
    const location = 123;
    s3.upload = sinon.stub().yieldsAsync(null, { ETag: checksum.eTag, Location: location });

    return expect(testStorage.put(buffer, path, mimeType))
      .to.be.rejectedWith(testStorage.StorageError)
      .then(() => {
        sinon.assert.calledOnce(s3.upload);
        sinon.assert.calledWith(s3.upload, expectedParams);
      });
  });

  it('should store a buffer', () => {
    const location = 'https://s3.com/1.jpg';
    s3.upload = sinon.stub().yieldsAsync(null, { ETag: checksum.eTag, Location: location });

    return expect(testStorage.put(buffer, path, mimeType))
      .to.be.eventually.fulfilled
      .then(() => {
        sinon.assert.calledOnce(s3.upload);
        sinon.assert.calledWith(s3.upload, expectedParams);
      });
  });
});
