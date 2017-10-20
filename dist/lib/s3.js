'use strict';var crypto = require('crypto');
var Joi = require('joi');
var is = require('valido');
var AWS = require('aws-sdk');
var hash = require('@moooji/hash');
var createError = require('custom-error-generator');

var optionsSchema = Joi.object().keys({
  accessKeyId: Joi.string().required(),
  secretAccessKey: Joi.string().required(),
  bucket: Joi.string().required(),
  region: Joi.string().required(),
  client: [Joi.object(), Joi.func()] }).
required();

/**
             * Storage Client constructor
             *
             * @param {object} options - S3 options
             * @constructor
             */
function StorageClient(options) {
  Joi.assert(options, optionsSchema);var


  region =




  options.region,accessKeyId = options.accessKeyId,secretAccessKey = options.secretAccessKey,bucket = options.bucket,client = options.client;

  this.bucket = bucket;
  this.client = client || new AWS.S3({ region: region, accessKeyId: accessKeyId, secretAccessKey: secretAccessKey });
  this.StorageError = createError('StorageError');
}

/**
   * Stores a buffer as object in S3
   *
   * @param {string} key - Key
   * @param {Buffer} buffer - Buffer
   * @param {string} mimeType - MIME type
   * @returns {Promise}
   */
StorageClient.prototype.save = function save(key, buffer, mimeType) {var _this = this;var isPublic = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return new Promise(function (resolve, reject) {
    var checksum = _this.getChecksum(buffer);

    var params = {
      Bucket: _this.bucket,
      Key: key,
      Body: buffer,
      ACL: isPublic ? 'public-read' : 'private',
      ContentType: mimeType,
      ContentMD5: hash(buffer, "base64") };


    return _this.client.upload(params, function (err, res) {
      if (err) {
        return reject(err);
      }

      return resolve(res.Location);
    });
  });
};

/**
    * Removes one or several objects from S3
    *
    * @param {string|Array<String>} keys - Keys
    * @returns {Promise}
    */
StorageClient.prototype.remove = function remove(keys) {var _this2 = this;
  return new Promise(function (resolve, reject) {
    var objects = keys.map(function (key) {
      return { Key: key };
    });

    var params = {
      Bucket: _this2.bucket,
      Delete: {
        Objects: objects,
        Quiet: false },

      RequestPayer: 'requester' };


    return _this2.client.deleteObjects(params, function (err, res) {
      if (err) {
        return reject(err);
      }

      if (!res || !res.Deleted) {
        return reject(new _this2.StorageError('S3 did not return valid deletion result'));
      }

      var deletedPaths = res.Deleted.map(function (item) {return item.Key;});
      return resolve({ paths: deletedPaths });
    });
  });
};

module.exports = StorageClient;