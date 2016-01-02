'use strict';

const errors = require('./lib/errors');
const Storage = require('./lib/storage');

const StorageError = errors.StorageError;
const InvalidArgumentError = errors.InvalidArgumentError;

/**
 * Factory that returns a Storage
 *
 * @param {object} options - S3 options
 * @returns {Storage}
 */
function create(options) {
  return new Storage(options);
}

module.exports.create = create;
module.exports.StorageError = StorageError;
module.exports.InvalidArgumentError = InvalidArgumentError;
