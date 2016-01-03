'use strict';

const _ = require('lodash');
const s3 = require('./aws-s3');
const errors = require('./errors');
const md5 = require('./md5');

const InvalidArgumentError = errors.InvalidArgumentError;
const StorageError = errors.StorageError;

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

    const checksum = md5(buffer);

    const params = {
      Bucket: this._bucket,
      Key: path,
      Body: buffer,
      ACL: this._acl,
      ContentType: mimeType,
      ContentMD5: checksum.base64
    };

    this._s3.put(params, (err, res) => {
      if (err) {
        return reject(err);
      }

      if (res.ETag !== checksum.eTag) {
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
    let objects = null;

    if (_.isString(paths)) {
      objects = { Key: paths };
    } else if (_.isArray(paths)) {
      objects = paths.map((path) => {
        return { Key: path };
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
  if (!_.isString(options.accessKeyId)) {
    throw new InvalidArgumentError('Missing AWS accessKeyId');
  }

  if (!_.isString(options.secretAccessKey)) {
    throw new InvalidArgumentError('Missing AWS secretAccessKey');
  }

  if (!_.isString(options.region)) {
    throw new InvalidArgumentError('Missing AWS S3 region');
  }

  if (!_.isString(options.bucket)) {
    throw new InvalidArgumentError('Missing AWS S3 bucket');
  }
};

module.exports = Storage;
