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

  before(() => {
    s3 = sinon.mock();
    s3.deleteObjects = sinon.stub().yieldsAsync(null, { Deleted: [{ Key: 'abc' }] });

    testStorage = storage.create({
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

  it('should be rejected with an InvalidArgumentError if path is an empty array', () => {
    return expect(testStorage.remove([]))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.deleteObjects));
  });

  it('should be rejected with an InvalidArgumentError if path is an non string array', () => {
    return expect(testStorage.remove(['abc', 123, {}]))
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
});
