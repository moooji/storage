'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const storage = require('../main');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Put', () => {
  let s3 = null;
  let testStorage = null;
  const buffer = new Buffer('data');
  const path = 'folder/image.jpg';
  const mimeType = 'image/jpeg';

  before(() => {
    s3 = sinon.mock();
    s3.put = sinon.stub().yieldsAsync(null, { ETag: '123', Location: 'loc' });

    testStorage = storage.create({
      s3,
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket'
    });
  });

  after(() => {
    s3 = null;
    testStorage = null;
  });

  it('should be rejected with an InvalidArgumentError if buffer is invalid', () => {
    return expect(testStorage.put(123, path, mimeType))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.put));
  });

  it('should be rejected with an InvalidArgumentError if path is invalid', () => {
    return expect(testStorage.put(buffer, 123, mimeType))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.put));
  });

  it('should be rejected with an InvalidArgumentError if MIME type is invalid', () => {
    return expect(testStorage.put(buffer, path, 123))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.put));
  });

  it('should store a buffer', () => {

    return expect(testStorage.put(buffer, path, mimeType))
      .to.be.eventually.fulfilled
      .then(() => sinon.assert.calledOnce(s3.put));
  });
});
