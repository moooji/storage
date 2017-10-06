'use strict';

const is = require('valido');
const createError = require('custom-error-generator');

const S3 = require('./lib/s3');
const GCS = require('./lib/gcs');

/**
 * Factory that returns a Storage instance
 *
 * @param {object} options Options
 * @returns {Storage}
 */
function create(options) {
  return new Storage(options)
}

function Storage(options) {  
  if (!options) {
    throw new TypeError('Invalid Options');
  }

  if (options.s3 && options.gcs) {
    throw new TypeError('S3 and GCS cannot be used together');
  }

  if (options.client) {
    this.client = options.client;
  } else if (options.s3) {
    this.client = new S3(options.s3);
  } else if (options.gcs) {
    this.client = new GCS(options.gcs);
  }

  this.StorageError = createError('StorageError');
}

/**
 * Stores a buffer as object in Storage
 *
 * @param {Buffer} buffer - Buffer
 * @param {string} key - Key
 * @param {string} mimeType - MIME type
 * @returns {Promise}
 */
Storage.prototype.put = async function put(buffer, key, mimeType) {
  if (!is.buffer(buffer)) {
    throw new TypeError('No buffer provided');
  }

  if (!is.string(key)) {
    throw new TypeError('No valid key provided');
  }

  if (!is.string(mimeType)) {
    throw new TypeError('No valid mime type provided');
  }

  try {
    await this.client.put(buffer, key, mimeType);
  } catch (err) {
    throw new this.StorageError(`Could not store object ${key} - ${err.message}`);
  }
}

/**
 * Removes one or several objects from Storage
 *
 * @param {string|Array<string>} key - Key(s)
 * @returns {Promise}
 */
Storage.prototype.remove = async function remove(key) {
  let keys = null;

  if (is.string(key)) {
    keys = [key];
  } else if (is.all.string(key)) {
    keys = key;
  }

  if (!keys) {
    throw new TypeError('No valid object keys provided');
  }

  try {
    await this.client.remove(keys);
  } catch (err) {
    throw new this.StorageError(`Could not remove object(s) ${keys} - ${err.message}`);
  }
}

module.exports = create;
