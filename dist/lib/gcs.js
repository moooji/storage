'use strict';function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}const crypto = require('crypto');
const Joi = require('joi');
const is = require('valido');
const hash = require('@moooji/hash');
const GCS = require('@google-cloud/storage');
const createError = require('custom-error-generator');

const optionsSchema = Joi.object().keys({
  projectId: Joi.string().required(),
  bucket: Joi.string().required(),
  credentials: Joi.object(),
  client: [Joi.object(), Joi.func()] }).
required();

/**
             * Storage Client constructor
             *
             * @param {object} options - GCS options
             * @constructor
             */
function StorageClient(options) {
  Joi.assert(options, optionsSchema);

  const {
    projectId,
    bucket,
    client } =
  options;

  this.client = client || GCS(options);
  this.bucket = this.client.bucket(bucket);
  this.StorageError = createError('StorageError');
}

/**
   * Stores a buffer as object in GCS
   *
   * @param {string} key - Key
   * @param {Buffer} buffer - Buffer
   * @param {string} mimeType - MIME type
   * @returns {Promise}
   */
StorageClient.prototype.save = (() => {var _ref = _asyncToGenerator(function* (key, buffer, mimeType, isPublic = false) {
    try {
      if (!is.string(key)) {
        throw new TypeError('No valid key provided');
      }

      if (!is.buffer(buffer)) {
        throw new TypeError('No buffer provided');
      }

      if (!is.string(mimeType)) {
        throw new TypeError('No valid mime type provided');
      }

      const file = this.bucket.file(key);

      const metadata = {
        md5Hash: hash(buffer, "base64"),
        contentType: mimeType };


      if (isPublic) {
        metadata.acl = [
        {
          entity: 'allUsers',
          role: this.client.acl.READER_ROLE }];


      }

      yield file.save(buffer, { metadata });
    } catch (err) {
      throw new this.StorageError(`Could not store object in GCS bucket - ${err.message}`);
    }
  });function save(_x, _x2, _x3) {return _ref.apply(this, arguments);}return save;})();

/**
                                                                                         * Removes one or several objects from GCS
                                                                                         *
                                                                                         * @param {string|Array<String>} keys - Keys
                                                                                         * @returns {Promise}
                                                                                         */
StorageClient.prototype.remove = (() => {var _ref2 = _asyncToGenerator(function* (keys) {

  });function remove(_x4) {return _ref2.apply(this, arguments);}return remove;})();

module.exports = StorageClient;