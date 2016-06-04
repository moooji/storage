'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const storage = require('../main');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Remove', () => {
  let s3 = null;
  let testStorage = null;
  const bucket = 'bucket';
  const pathA = 'image1.jpg';
  const pathB = 'image2.jpg';
  const paths = [pathA, pathB];
  const object = { Key: pathA };
  const objects = [{ Key: pathA }, { Key: pathB }];

  const expectedParamsPath = {
    Bucket: bucket,
    Delete: {
      Objects: object,
      Quiet: false,
    },
    RequestPayer: 'requester',
  };

  const expectedParamsPaths = {
    Bucket: bucket,
    Delete: {
      Objects: objects,
      Quiet: false,
    },
    RequestPayer: 'requester',
  };

  before(() => {
    s3 = sinon.mock();
    s3.deleteObjects = sinon.stub().yieldsAsync(null, { Deleted: objects });

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

  it('should be rejected with an InvalidArgumentError if path is a number', () => {
    return expect(testStorage.remove(123))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.deleteObjects));
  });

  it('should be rejected with an InvalidArgumentError if path is an object', () => {
    return expect(testStorage.remove({}))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.deleteObjects));
  });

  it('should be rejected with an InvalidArgumentError if path is null', () => {
    return expect(testStorage.remove(null))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.deleteObjects));
  });

  it('should be rejected with an InvalidArgumentError if path is undefined', () => {
    return expect(testStorage.remove(undefined))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.deleteObjects));
  });

  it('should remove an object', () => {
    s3.deleteObjects = sinon.stub().yieldsAsync(null, { Deleted: object });

    return expect(testStorage.remove(pathA))
      .to.be.eventually.fulfilled
      .then(() => {
        sinon.assert.calledOnce(s3.deleteObjects);
        sinon.assert.calledWith(s3.deleteObjects, expectedParamsPath);
      });
  });

  it('should remove several objects', () => {
    s3.deleteObjects = sinon.stub().yieldsAsync(null, { Deleted: objects });

    return expect(testStorage.remove(paths))
      .to.be.eventually.fulfilled
      .then(() => {
        sinon.assert.calledOnce(s3.deleteObjects);
        sinon.assert.calledWith(s3.deleteObjects, expectedParamsPaths);
      });
  });

  it('should be rejected with an StorageError if invalid deletion info is returned', () => {
    s3.deleteObjects = sinon.stub().yieldsAsync(null, { Deleted: null });

    return expect(testStorage.remove(paths))
      .to.be.rejectedWith(testStorage.StorageError)
      .then(() => {
        sinon.assert.calledOnce(s3.deleteObjects);
        sinon.assert.calledWith(s3.deleteObjects, expectedParamsPaths);
      });
  });
});
