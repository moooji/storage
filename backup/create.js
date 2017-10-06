'use strict';

const chai = require('chai');
const createStorage = require('../index');
const Storage = require('../lib/s3');

const expect = chai.expect;

describe('Create', () => {
  it('should throw TypeError if AWS Access Key Id is invalid', () => {
    const options = {
      accessKeyId: 123,
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket',
    };

    expect(() => createStorage({ s3: options })).to.throw(TypeError);
  });

  it('should throw TypeError if AWS Secret Access Key invalid', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 123,
      region: 'region',
      bucket: 'bucket',
    };

    expect(() => createStorage({ s3: options }))
      .to.throw(TypeError);
  });

  it('should throw TypeError if AWS region is invalid', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 123,
      bucket: 'bucket',
    };

    expect(() => createStorage({ s3: options }))
      .to.throw(TypeError);
  });

  it('should throw TypeError if AWS S3 bucket is invalid', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 123,
    };

    expect(() => createStorage({ s3: options }))
      .to.throw(TypeError);
  });

  it('should create a storage', () => {
    const options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket',
    };

    expect(createStorage({ s3: options }))
      .to.be.an.instanceof(Storage);
  });
});
