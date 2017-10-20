'use strict';

const Joi = require('joi');
const is = require('valido');
const S3 = require('./lib/s3');
const GCS = require('./lib/gcs');

const optionsSchema = Joi.alternatives().try(
  Joi.object().keys({
    s3: Joi.object().required(),
  }),
  Joi.object().keys({
    gcs: Joi.object().required(),
  }),
  Joi.object().keys({
    client: Joi.object().required()
  })
).required();

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
  Joi.assert(options, optionsSchema);

  if (options.client) {
    this.client = options.client;
  } else if (options.s3) {
    this.client = new S3(options.s3);
  } else if (options.gcs) {
    this.client = new GCS(options.gcs);
  }

  this.StorageError = this.client.StorageError;
}

/**
 * Stores a buffer as object in Storage
 *
 * @param {string} key - Key
 * @param {Buffer} buffer - Buffer
 * @param {string} mimeType - MIME type
 * @returns {Promise}
 */
Storage.prototype.save = async function save(key, buffer, mimeType, isPublic = false) {
  if (!is.string(key)) {
    throw new TypeError('No valid key provided');
  }

  if (!is.buffer(buffer)) {
    throw new TypeError('No buffer provided');
  }

  if (!is.string(mimeType)) {
    throw new TypeError('No valid mime type provided');
  }

  try {
    await this.client.save(key, buffer, mimeType, isPublic);
  } catch (err) {
    throw new this.StorageError(`Could not store object [${key}] - ${err.message}`);
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
