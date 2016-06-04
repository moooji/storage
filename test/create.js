'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const storageProvider = require('../main');
const Storage = require('../lib/storage');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Create', () => {
  it('should throw InvalidArgumentError if AWS Access Key Id is invalid', () => {
    const options = {
      accessKeyId: 123,
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket',
    };

    return expect(() => storageProvider.create(options))
      .to.throw(storageProvider.InvalidArgumentError);
  });

  it('should throw InvalidArgumentError if AWS Secret Access Key invalid', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 123,
      region: 'region',
      bucket: 'bucket',
    };

    return expect(() => storageProvider.create(options))
      .to.throw(storageProvider.InvalidArgumentError);
  });

  it('should throw InvalidArgumentError if AWS region is invalid', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 123,
      bucket: 'bucket',
    };

    return expect(() => storageProvider.create(options))
      .to.throw(storageProvider.InvalidArgumentError);
  });

  it('should throw InvalidArgumentError if AWS S3 bucket is invalid', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 123,
    };

    return expect(() => storageProvider.create(options))
      .to.throw(storageProvider.InvalidArgumentError);
  });

  it('should create a storage', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket',
    };

    return expect(storageProvider.create(options))
      .to.be.an.instanceof(Storage);
  });
});
