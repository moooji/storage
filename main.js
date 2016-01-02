'use strict';

const crypto = require('crypto');
const _ = require('lodash');
const s3 = require('./lib/s3');
const errors = require('./lib/errors');

const StorageError = errors.StorageError;
const InvalidArgumentError = errors.InvalidArgumentError;

/**
 * Factory that returns a Storage
 *
 * @param options - S3 options
 */
function create(options) {
  return new Storage(options);
}

/**
 * Storage constructor
 *
 * @param {object} options - S3 options
 * @constructor
 */
function Storage(options) {
  this._validateOptions(options);
  this._s3 = s3.create(options);
  this._bucket = options.bucket;
  this._acl = options.acl ? options.acl : 'public-read';
}

/**
 * Stores a buffer as object in storage
 *
 * @param {Buffer} buffer - Buffer
 * @param {String} path - Path
 * @param {String} mimeType - MIME type
 * @returns {Promise}
 */

Storage.prototype.put = function (buffer, path, mimeType) {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(buffer)) {
      return reject(new InvalidArgumentError('No buffer provided'));
    }

    if (!_.isString(path)) {
      return reject(new InvalidArgumentError('No valid path provided'));
    }

    if (!_.isString(mimeType)) {
      return reject(new InvalidArgumentError('No valid mime type provided'));
    }

    // Calculate MD5 checksum of buffer
    // Amazon S3 will cross-check and return an error
    // if checksum of stored file does not match
    const bufferHash = crypto.createHash('md5');
    bufferHash.update(buffer);

    const bufferHashBase64 = bufferHash.digest('base64');
    const eTag = '"' + new Buffer(bufferHashBase64, 'base64').toString('hex') + '"';

    const params = {
      Bucket: this._bucket,
      Key: path,
      Body: buffer,
      ACL: this._acl,
      ContentType: mimeType,
      ContentMD5: bufferHashBase64
    };

    this._s3.put(params, (err, res) => {
      if (err) {
        return reject(err);
      }

      if (res.ETag !== eTag) {
        return reject(new StorageError('ETag does not match buffer MD5 hash'));
      }

      if (!_.isString(res.Location)) {
        return reject(new StorageError('S3 did not return storage URL'));
      }

      return resolve({
        eTag: res.ETag,
        url: res.Location
      });
    });
  });
};

/**
 * Removes one or several objects from storage
 *
 * @param {String|Array<String>} paths - Paths
 * @returns {Promise}
 */

Storage.prototype.remove = function (paths) {
  return new Promise((resolve, reject) => {
    const objects = [];

    if (_.isString(paths)) {
      objects.push({ Key: paths });
    } else if (_.isArray(paths)) {
      _.uniq(paths).forEach((path) => {
        if (!_.isString(path)) {
          return reject(new InvalidArgumentError('No valid paths provided'));
        }

        objects.push({ Key: path });
      });
    } else {
      return reject(new InvalidArgumentError('No valid paths provided'));
    }

    const params = {
      Bucket: this._bucket,
      Delete: {
        Objects: objects,
        Quiet: false
      },
      RequestPayer: 'requester'
    };

    this._s3.deleteObjects(params, (err, res) => {
      if (err) {
        return reject(err);
      }

      if (!res || !res.Deleted) {
        return reject(new StorageError('S3 did not return valid deletion result'));
      }

      const deletedPaths = _.map(res.Deleted, (item) => {
        return item.Key;
      });

      return resolve({ paths: deletedPaths });
    });
  });
};

Storage.prototype._validateOptions = function (options) {
  if (!options.accessKeyId) {
    throw new InvalidArgumentError('Missing AWS accessKeyId');
  }

  if (!options.secretAccessKey) {
    throw new InvalidArgumentError('Missing AWS secretAccessKey');
  }

  if (!options.region) {
    throw new InvalidArgumentError('Missing AWS S3 region');
  }

  if (!options.bucket) {
    throw new InvalidArgumentError('Missing AWS S3 bucket');
  }
};

module.exports.create = create;
