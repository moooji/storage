'use strict';

const _ = require('lodash');
const s3 = require('./aws-s3');
const errors = require('./errors');
const md5 = require('./md5');

const StorageError = errors.StorageError;

/**
 * Storage constructor
 *
 * @param {object} options - S3 options
 * @constructor
 */
function Storage(options) {
  this.validateOptions(options);
  this.s3 = s3.create(options);
  this.bucket = options.bucket;
  this.acl = options.acl ? options.acl : 'public-read';
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
      return reject(new TypeError('No buffer provided'));
    }

    if (!_.isString(path)) {
      return reject(new TypeError('No valid path provided'));
    }

    if (!_.isString(mimeType)) {
      return reject(new TypeError('No valid mime type provided'));
    }

    const checksum = md5(buffer);

    const params = {
      Bucket: this.bucket,
      Key: path,
      Body: buffer,
      ACL: this.acl,
      ContentType: mimeType,
      ContentMD5: checksum.base64,
    };

    return this.s3.upload(params, (err, res) => {
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
        url: res.Location,
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
      return reject(new TypeError('No valid paths provided'));
    }

    const params = {
      Bucket: this.bucket,
      Delete: {
        Objects: objects,
        Quiet: false,
      },
      RequestPayer: 'requester',
    };

    return this.s3.deleteObjects(params, (err, res) => {
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

Storage.prototype.validateOptions = function (options) {
  if (!_.isString(options.accessKeyId)) {
    throw new TypeError('Missing AWS accessKeyId');
  }

  if (!_.isString(options.secretAccessKey)) {
    throw new TypeError('Missing AWS secretAccessKey');
  }

  if (!_.isString(options.region)) {
    throw new TypeError('Missing AWS S3 region');
  }

  if (!_.isString(options.bucket)) {
    throw new TypeError('Missing AWS S3 bucket');
  }
};

module.exports = Storage;
