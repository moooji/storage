'use strict';

const chai = require('chai');
const md5 = require('../lib/md5');
const errors = require('../lib/errors');

const expect = chai.expect;

describe('MD5', () => {
  it('should throw InvalidArgumentError buffer is invalid', () => {
    return expect(() => md5(123))
      .to.throw(errors.InvalidArgumentError);
  });

  it('should create MD5 base64 and eTag for a buffer', () => {
    const buffer = new Buffer('data');
    const expectedResult = {
      base64: 'jXd/OF09/siBXSD3SWAm3A==',
      eTag: '"8d777f385d3dfec8815d20f7496026dc"',
    };

    return expect(md5(buffer))
      .to.deep.equal(expectedResult);
  });
});
