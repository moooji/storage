'use strict';

const crypto = require('crypto');
const AWS = require('aws-sdk');
const _ = require('lodash');
const createError = require('custom-error-generator');

const StorageError = createError('StorageError');
const InvalidArgumentError = createError('InvalidArgumentError');

function storageProvider(options) {

  validateOptions(options);

  const s3 = new AWS.S3({
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
    region: options.region
  });

  const bucket = options.bucket;
  const acl = options.acl ? options.acl : 'public-read';
  const uploadAsync = Bluebird.promisify(s3.upload, s3);
  const deleteAsync = Bluebird.promisify(s3.deleteObjects, s3);

  /**
   * Stores a buffer as object in storage
   *
   * @param {Buffer }buffer
   * @param {String} path
   * @param {String} mimeType
   * @param {Function} [callback]
   * @returns {Promise}
   */

  function put(buffer, path, mimeType, callback) {

    if (!Buffer.isBuffer(buffer)) {
      throw new InvalidArgumentError('No buffer provided');
    }

    if (!_.isString(path)) {
      throw new InvalidArgumentError('No valid path provided');
    }

    if (!_.isString(mimeType)) {
      throw new InvalidArgumentError('No valid mime type provided');
    }

    // Calculate MD5 checksum of buffer
    // Amazon S3 will cross-check and return an error
    // if checksum of stored file does not match
    let bufferHash = crypto.createHash('md5');
    bufferHash.update(buffer);

    const bufferHashBase64 = bufferHash.digest('base64');
    const eTag = '"' + new Buffer(bufferHashBase64, 'base64').toString('hex') + '"';

    const params = {
      Bucket: bucket,
      Key: path,
      Body: buffer,
      ACL: acl,
      ContentType: mimeType,
      ContentMD5: bufferHashBase64
    };

    return uploadAsync(params)
      .then((data) => {

        if (data.ETag !== eTag) {
          throw new StorageError('ETag does not match buffer MD5 hash');
        }

        if (!_.isString(data.Location)) {
          throw new StorageError('S3 did not return storage Url');
        }

        return {
          eTag: data.ETag,
          url: data.Location
        };
      })
      .nodeify(callback);
  }

  /**
   * Removes one or several objects from storage
   *
   * @param {String|Array<String>} paths
   * @param {Function} [callback]
   * @returns {Promise}
   */

  function remove(paths, callback) {

    let objects = [];

    if (_.isString(paths)) {

      // Build object and add to list
      objects.push({Key: paths});

    } else if (_.isArray(paths) && paths.length) {

      // Ensure uniqueness
      paths = _.uniq(paths);

      // Iterate through paths
      // and ensure that they are strings
      paths.forEach((path) => {

        if (!_.isString(path)) {
          throw new InvalidArgumentError('No valid path provided');
        }

        // Build object and add to list
        objects.push({Key: path});
      });
    } else {
      throw new InvalidArgumentError('No valid path provided');
    }

    const params = {
      Bucket: bucket,
      Delete: {
        Objects: objects,
        Quiet: false
      },
      RequestPayer: 'requester'
    };

    return deleteAsync(params)
      .then((data) => {

        if (!data || !data.Deleted) {
          throw new StorageError('S3 did not return valid deletion result');
        }

        const paths = _.map(data.Deleted, (item) => {
          return item.Key;
        });

        return {paths: paths};
      })
      .nodeify(callback);
  }

  function validateOptions(options) {

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
  }

  return {
    put: put,
    remove: remove,
    InvalidArgumentError: InvalidArgumentError,
    StorageError: StorageError
  };
}

module.exports = storageProvider;
