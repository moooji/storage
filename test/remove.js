'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const storage = require('../main');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Remove', () => {
  let testStorage = null;

  before(() => {
    testStorage = storage.create({
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket'
    });
  });

  after(() => {
    testStorage = null;
  });

  it('should be.rejectedWith an InvalidArgumentError if path is a number', () => {
    return expect(testStorage.remove(123))
      .to.be.rejectedWith(testStorage.InvalidArgumentError);
  });

  it('should be.rejectedWith an InvalidArgumentError if path is an object', () => {
    return expect(testStorage.remove({}))
      .to.be.rejectedWith(testStorage.InvalidArgumentError);
  });

  it('should be.rejectedWith an InvalidArgumentError if path is an empty array', () => {
    return expect(testStorage.remove([]))
      .to.be.rejectedWith(testStorage.InvalidArgumentError);
  });

  it('should be.rejectedWith an InvalidArgumentError if path is an non string array', () => {
    return expect(testStorage.remove(['abc', 123, {}]))
      .to.be.rejectedWith(testStorage.InvalidArgumentError);
  });

  it('should be.rejectedWith an InvalidArgumentError if path is null', () => {
    return expect(testStorage.remove(null))
      .to.be.rejectedWith(testStorage.InvalidArgumentError);
  });

  it('should be.rejectedWith an InvalidArgumentError if path is undefined', () => {
    return expect(testStorage.remove(undefined))
      .to.be.rejectedWith(testStorage.InvalidArgumentError);
  });
});
