"use strict";

var crypto = require("crypto");
var Promise = require("bluebird");
var AWS = require("aws-sdk");
var _ = require("lodash");
var createError = require('custom-error-generator');

var StorageError = createError('StorageError');
var InvalidArgumentError = createError('InvalidArgumentError');

function storageProvider (options) {

  validateOptions(options);

  const s3 = new AWS.S3({
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
    region: options.region
  });

  const bucket = options.bucket;
  const acl = options.acl ? options.acl : "public-read";
  const uploadAsync = Promise.promisify(s3.upload, s3);
  const deleteAsync = Promise.promisify(s3.deleteObjects, s3);

  /***
   * Stores a buffer as object in storage
   * @param {Buffer }buffer
   * @param {String} path
   * @param {String} mimeType
   * @param {Function} [callback]
   * @returns {Promise}
   */
  function put (buffer, path, mimeType, callback) {

    if (!Buffer.isBuffer(buffer)) {
      throw InvalidArgumentError("No buffer provided");
    }

    if (!_.isString(path)) {
      throw InvalidArgumentError("No valid path provided");
    }

    if (!_.isString(mimeType)) {
      throw InvalidArgumentError("No valid mime type provided");
    }

    // Calculate MD5 checksum of buffer
    // Amazon S3 will cross-check and return an error
    // if checksum of stored file does not match
    let bufferHash = crypto.createHash('md5');
    bufferHash.update(buffer);

    const bufferHashBase64 = bufferHash.digest('base64');
    const eTag = '"' + Buffer(bufferHashBase64, 'base64').toString('hex') + '"';

    const params = {
      Bucket: bucket,
      Key: path,
      Body: buffer,
      ACL: acl,
      ContentType: mimeType,
      ContentMD5: bufferHashBase64
    };

    return uploadAsync(params)
      .then(function (data) {

        if (data.ETag !== eTag) {
          throw StorageError("ETag does not match buffer MD5 hash");
        }

        if (!_.isString(data.Location)) {
          throw StorageError("S3 did not return storage Url");
        }

        return {
          eTag: data.ETag,
          url: data.Location
        };
      })
      .nodeify(callback);
  }

  /***
   * Removes one or several objects from storage
   * @param {String || [String]} paths
   * @param {Function} [callback]
   * @returns {Promise}
   */
  function remove (paths, callback) {

    let objects = [];

    if (!(_.isString(paths) || _.isArray(paths))) {
      throw InvalidArgumentError("No valid path provided");
    }

    if (_.isArray(paths) && !paths.length) {
      throw InvalidArgumentError("No valid path provided");
    }

    if(_.isArray(paths)) {

      // Ensure uniqueness
      paths = _.uniq(paths);

      // Iterate through paths
      // and ensure that they are strings
      for (let path of paths) {

        if (!_.isString(path)) {
          throw InvalidArgumentError("No valid path provided");
        }

        // Build object and add to list
        objects.push({ Key: path });
      }
    }
    else {
      objects.push({ Key: paths });
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
        .then(function (data) {

          if(!_.isString(data.Key) || !_.isString(data.VersionId)) {
            throw StorageError("S3 did not return valid deletion result");
          }

          return {
            path: data.Key,
            versionId: data.VersionId
          };
        })
        .nodeify(callback);
  }

  function validateOptions (options) {

    if (!options.accessKeyId) {
      throw InvalidArgumentError("No AWS 'accessKeyId' provided");
    }

    if (!options.secretAccessKey) {
      throw InvalidArgumentError("No AWS 'secretAccessKey' provided");
    }

    if (!options.region) {
      throw InvalidArgumentError("No AWS S3 'region' provided");
    }

    if (!options.bucket) {
      throw InvalidArgumentError("No AWS S3 'bucket' provided");
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