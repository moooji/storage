'use strict';

const expect = require('chai').expect;
const storageProvider = require('../main');

describe('Remove', () => {

  let storage = null;

  before(() => {

    storage = storageProvider({
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      region: 'region',
      bucket: 'bucket'
    });
  });

  after(() => {
    storage = null;
  });

  it('should throw an InvalidArgumentError if path is a number', () => {

    expect(() => {
      return storage.remove(123);
    }).to.throw(storage.InvalidArgumentError);
  });

  it('should throw an InvalidArgumentError if path is an object', () => {

    expect(() => {
      return storage.remove({});
    }).to.throw(storage.InvalidArgumentError);
  });

  it('should throw an InvalidArgumentError if path is an empty array', () => {

    expect(() => {
      return storage.remove([]);
    }).to.throw(storage.InvalidArgumentError);
  });

  it('should throw an InvalidArgumentError if path is an non string array', () => {

    expect(() => {
      return storage.remove(['abc', 123, {}]);
    }).to.throw(storage.InvalidArgumentError);
  });

  it('should throw an InvalidArgumentError if path is null', () => {

    expect(() => {
      return storage.remove(null);
    }).to.throw(storage.InvalidArgumentError);
  });

  it('should throw an InvalidArgumentError if path is undefined', () => {

    expect(() => {
      return storage.remove(undefined);
    }).to.throw(storage.InvalidArgumentError);
  });
});
