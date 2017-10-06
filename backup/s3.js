'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = require('chai').expect;
const chaiAsPromised = require('chai-as-promised');
const createStorage = require('../lib');

chai.use(chaiAsPromised);

/**
 * Create
 */
describe('Storage - Create', () => {
  it('should throw TypeError if AWS Access Key Id is invalid', () => {
    const options = {
      accessKeyId: 123,
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket',
    };

    expect(() => createStorage(options)).to.throw(TypeError);
  });

  it('should throw TypeError if AWS Secret Access Key invalid', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 123,
      region: 'region',
      bucket: 'bucket',
    };

    expect(() => createStorage(options)).to.throw(TypeError);
  });

  it('should throw TypeError if AWS region is invalid', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 123,
      bucket: 'bucket',
    };

    expect(() => createStorage(options)).to.throw(TypeError);
  });

  it('should throw TypeError if AWS S3 bucket is invalid', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 123,
    };

    expect(() => createStorage(options)).to.throw(TypeError);
  });

  it('should have default "private" ACL', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket',
    };

    const testStorage = createStorage(options);
    expect(testStorage.acl).to.equal('private');
  });

  it('should override ACL', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket',
      acl: 'public-read',
    };

    const testStorage = createStorage(options);
    expect(testStorage.acl).to.deep.equal(options.acl);
  });

  it('should override S3 client', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket',
      s3: { put: () => {} },
    };

    const testStorage = createStorage(options);
    expect(testStorage.s3).to.deep.equal(options.s3);
  });
});

/**
 * Checksum
 */
describe('Storage - Checksum', () => {
  const s3 = {};

  const testStorage = createStorage({
    s3,
    bucket: 'bucket',
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    region: 'region',
  });

  it('should throw TypeError buffer is invalid', () => {
    return expect(() => testStorage.getChecksum(123))
      .to.throw(TypeError);
  });

  it('should create MD5 base64 and eTag for a buffer', () => {
    const buffer = new Buffer('data');
    const expectedResult = {
      base64: 'jXd/OF09/siBXSD3SWAm3A==',
      eTag: '"8d777f385d3dfec8815d20f7496026dc"',
    };

    return expect(testStorage.getChecksum(buffer))
      .to.deep.equal(expectedResult);
  });
});


/**
 * Put
 */
describe('Storage - Put', () => {
  let s3 = null;
  let testStorage = null;
  const buffer = new Buffer('data');
  const path = 'folder/image.jpg';
  const mimeType = 'image/jpeg';
  const bucket = 'bucket';
  const checksum = {
    base64: 'jXd/OF09/siBXSD3SWAm3A==',
    eTag: '"8d777f385d3dfec8815d20f7496026dc"',
  };

  const expectedParams = {
    ACL: 'private',
    Body: buffer,
    Bucket: bucket,
    ContentMD5: checksum.base64,
    ContentType: mimeType,
    Key: path,
  };

  before(() => {
    s3 = sinon.mock();
    s3.upload = sinon.stub().yieldsAsync(null, { ETag: '123', Location: 'loc' });

    testStorage = createStorage({
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

  it('should be rejected with TypeError if buffer is invalid', () => {
    return expect(testStorage.put(123, path, mimeType))
      .to.be.rejectedWith(TypeError)
      .then(() => sinon.assert.notCalled(s3.upload));
  });

  it('should be rejected with TypeError if path is invalid', () => {
    return expect(testStorage.put(buffer, 123, mimeType))
      .to.be.rejectedWith(TypeError)
      .then(() => sinon.assert.notCalled(s3.upload));
  });

  it('should be rejected with TypeError if MIME type is invalid', () => {
    return expect(testStorage.put(buffer, path, 123))
      .to.be.rejectedWith(TypeError)
      .then(() => sinon.assert.notCalled(s3.upload));
  });

  it('should be rejected with StorageError if eTags do not match', () => {
    const location = 'https://s3.com/1.jpg';
    s3.upload = sinon.stub().yieldsAsync(null, { ETag: 'abc', Location: location });

    return expect(testStorage.put(buffer, path, mimeType))
      .to.be.rejectedWith(testStorage.StorageError)
      .then(() => {
        sinon.assert.calledOnce(s3.upload);
        sinon.assert.calledWith(s3.upload, expectedParams);
      });
  });

  it('should be rejected with StorageError if invalid location is returned', () => {
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

/**
 * Remove
 */
describe('Storage - Remove', () => {
  let s3 = null;
  let testStorage = null;
  const bucket = 'bucket';
  const pathA = 'image1.jpg';
  const pathB = 'image2.jpg';
  const paths = [pathA, pathB];
  const deletedObject = [{ Key: pathA }];
  const deletedObjects = [{ Key: pathA }, { Key: pathB }];

  const expectedParamsPath = {
    Bucket: bucket,
    Delete: {
      Objects: deletedObject,
      Quiet: false,
    },
    RequestPayer: 'requester',
  };

  const expectedParamsPaths = {
    Bucket: bucket,
    Delete: {
      Objects: deletedObjects,
      Quiet: false,
    },
    RequestPayer: 'requester',
  };

  before(() => {
    s3 = sinon.mock();
    s3.deleteObjects = sinon.stub().yieldsAsync(null, { Deleted: deletedObjects });

    testStorage = createStorage({
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

  it('should be rejected with TypeError if path is a number', () => {
    return expect(testStorage.remove(123))
      .to.be.rejectedWith(TypeError)
      .then(() => sinon.assert.notCalled(s3.deleteObjects));
  });

  it('should be rejected with TypeError if path is an object', () => {
    return expect(testStorage.remove({}))
      .to.be.rejectedWith(TypeError)
      .then(() => sinon.assert.notCalled(s3.deleteObjects));
  });

  it('should be rejected with TypeError if path is null', () => {
    return expect(testStorage.remove(null))
      .to.be.rejectedWith(TypeError)
      .then(() => sinon.assert.notCalled(s3.deleteObjects));
  });

  it('should be rejected with TypeError if path is undefined', () => {
    return expect(testStorage.remove(undefined))
      .to.be.rejectedWith(TypeError)
      .then(() => sinon.assert.notCalled(s3.deleteObjects));
  });

  it('should remove an object', () => {
    s3.deleteObjects = sinon.stub().yieldsAsync(null, { Deleted: deletedObject });

    return expect(testStorage.remove(pathA))
      .to.be.eventually.fulfilled
      .then(() => {
        sinon.assert.calledOnce(s3.deleteObjects);
        sinon.assert.calledWith(s3.deleteObjects, expectedParamsPath);
      });
  });

  it('should remove objects', () => {
    s3.deleteObjects = sinon.stub().yieldsAsync(null, { Deleted: deletedObjects });

    return expect(testStorage.remove(paths))
      .to.be.eventually.fulfilled
      .then(() => {
        sinon.assert.calledOnce(s3.deleteObjects);
        sinon.assert.calledWith(s3.deleteObjects, expectedParamsPaths);
      });
  });

  it('should be rejected with StorageError if invalid deletion info is returned', () => {
    s3.deleteObjects = sinon.stub().yieldsAsync(null, { Deleted: null });

    return expect(testStorage.remove(paths))
      .to.be.rejectedWith(testStorage.StorageError)
      .then(() => {
        sinon.assert.calledOnce(s3.deleteObjects);
        sinon.assert.calledWith(s3.deleteObjects, expectedParamsPaths);
      });
  });
});
