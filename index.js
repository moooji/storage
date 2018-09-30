'use strict';

const is = require('valido');
const createError = require('@moooji/error-builder');

const S3 = require('./lib/s3');
const GCS = require('./lib/gcs');

/**
 * Factory that returns a Storage instance
 *
 * @param {object} options Options
 * @returns {Storage}
 */
function create(bucket, provider, options, client) {
  return new Storage(bucket, provider, options, client)
}

function Storage(bucket, provider = "gcs", options = {}, client) {
  this.providers = ["s3", "gcs"];
  this.INVALID_BUCKET = 'storage/invalid-bucket';
  this.INVALID_PROVIDER = 'storage/invalid-provider';
  this.INVALID_CLIENT = 'storage/invalid-client';

  if (!is.string(bucket)) {
    throw createError("Invalid bucket name", this.INVALID_BUCKET);
  }

  if (is.existy(provider) && !this.providers.includes(provider)) {
    throw createError("Invalid provider", this.INVALID_PROVIDER);
  }

  if (!is.existy(provider) && !is.existy(client)) {
    throw createError("Invalid or missing client", this.INVALID_CLIENT);
  }

  if (client) {
    this.client = client;
  } else if (provider === "s3") {
    this.client = new S3(bucket, options, client);
  } else if (provider === "gcs") {
    this.client = new GCS(bucket, options, client);
  }
}

/**
 * Stores a buffer as object in Storage
 *
 * @param {string} key - Key
 * @param {Buffer} buffer - Buffer
 * @param {string} mimeType - MIME type
 * @returns {Promise}
 */
Storage.prototype.save = async function save(key, buffer, mimeType, cacheMaxAge, isPublic = false) {
  if (!is.string(key)) {
    throw new TypeError('No valid key provided');
  }

  if (!is.buffer(buffer)) {
    throw new TypeError('No buffer provided');
  }

  if (!is.string(mimeType)) {
    throw new TypeError('No valid mime type provided');
  }

  if (cacheMaxAge && !is.natural(cacheMaxAge)) {
    throw new TypeError('Invalid cache max-age provided');
  }

  return this.client.save(key, buffer, mimeType, cacheMaxAge, isPublic);
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

  return this.client.remove(keys);
}

module.exports = create;
