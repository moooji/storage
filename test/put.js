'use strict';

const expect = require('chai').expect;
const storageProvider = require('../main');

describe('Put', () => {

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
      return storage.put(123);
    }).to.throw(storage.InvalidArgumentError);
  });

  it('should throw an InvalidArgumentError if path is an object', () => {

    expect(() => {
      return storage.put({});
    }).to.throw(storage.InvalidArgumentError);
  });

  it('should throw an InvalidArgumentError if path is an array', () => {

    expect(() => {
      return storage.put([]);
    }).to.throw(storage.InvalidArgumentError);
  });

  it('should throw an InvalidArgumentError if path is null', () => {

    expect(() => {
      return storage.put(null);
    }).to.throw(storage.InvalidArgumentError);
  });

  it('should throw an InvalidArgumentError if path is undefined', () => {

    expect(() => {
      return storage.put(undefined);
    }).to.throw(storage.InvalidArgumentError);
  });
});
