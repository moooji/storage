'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const md5 = require('../lib/md5');
const storage = require('../main');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Put', () => {
  let s3 = null;
  let testStorage = null;
  const buffer = new Buffer('data');
  const path = 'folder/image.jpg';
  const mimeType = 'image/jpeg';
  const bucket = 'bucket';
  const checksum = md5(buffer);
  const expectedParams = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: bucket,
    ContentMD5: checksum.base64,
    ContentType: mimeType,
    Key: path
  };

  before(() => {
    s3 = sinon.mock();
    s3.putObject = sinon.stub().yieldsAsync(null, { ETag: '123', Location: 'loc' });

    testStorage = storage.create({
      s3,
      bucket,
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region'
    });
  });

  after(() => {
    s3 = null;
    testStorage = null;
  });

  it('should be rejected with an InvalidArgumentError if buffer is invalid', () => {
    return expect(testStorage.put(123, path, mimeType))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.putObject));
  });

  it('should be rejected with an InvalidArgumentError if path is invalid', () => {
    return expect(testStorage.put(buffer, 123, mimeType))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.putObject));
  });

  it('should be rejected with an InvalidArgumentError if MIME type is invalid', () => {
    return expect(testStorage.put(buffer, path, 123))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.putObject));
  });

  it('should be rejected with an StorageError if eTags do not match', () => {
    s3.putObject = sinon.stub().yieldsAsync(null, { ETag: 'abc', Location: 'location' });

    return expect(testStorage.put(buffer, path, mimeType))
      .to.be.rejectedWith(testStorage.StorageError)
      .then(() => {
        sinon.assert.calledOnce(s3.putObject);
        sinon.assert.calledWith(s3.putObject, expectedParams);
      });
  });

  it('should be rejected with an StorageError if invalid location is returned', () => {
    s3.putObject = sinon.stub().yieldsAsync(null, { ETag: checksum.eTag, Location: null });

    return expect(testStorage.put(buffer, path, mimeType))
      .to.be.rejectedWith(testStorage.StorageError)
      .then(() => {
        sinon.assert.calledOnce(s3.putObject);
        sinon.assert.calledWith(s3.putObject, expectedParams);
      });
  });

  it('should store a buffer', () => {
    s3.putObject = sinon.stub().yieldsAsync(null, { ETag: checksum.eTag, Location: 'location' });

    return expect(testStorage.put(buffer, path, mimeType))
      .to.be.eventually.fulfilled
      .then(() => {
        sinon.assert.calledOnce(s3.putObject);
        sinon.assert.calledWith(s3.putObject, expectedParams);
      });
  });
});
