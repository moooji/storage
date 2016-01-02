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

  before(() => {
    s3 = sinon.mock();
    s3.put = sinon.stub().yieldsAsync(null, { ETag: '123', Location: 'loc' });

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
    return expect(testStorage.put(123))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.put));
  });

  it('should be rejected with an InvalidArgumentError if path is an object', () => {
    return expect(testStorage.put({}))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.put));
  });

  it('should be rejected with an InvalidArgumentError if path is an array', () => {
    return expect(testStorage.put([]))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.put));
  });

  it('should be rejected with an InvalidArgumentError if path is null', () => {
    return expect(testStorage.put(null))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.put));
  });

  it('should be rejected with an InvalidArgumentError if path is undefined', () => {
    return expect(testStorage.put(undefined))
      .to.be.rejectedWith(testStorage.InvalidArgumentError)
      .then(() => sinon.assert.notCalled(s3.put));
  });
});
