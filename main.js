"use strict";

var crypto = require("crypto");
var Promise = require("bluebird");
var AWS = require("aws-sdk");
var _ = require("lodash");

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

  function put (buffer, path, mimeType, callback) {

    if (!Buffer.isBuffer(buffer)) {
      throw Error("No buffer provided");
    }

    if (!path || !_.isString(path)) {
      throw Error("No valid path provided");
    }

    if (!mimeType || !_.isString(mimeType)) {
      throw Error("No valid mime type provided");
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
          throw Error("ETag does not match buffer MD5 hash");
        }

        if (!_.isString(data.Location)) {
          throw Error("S3 did not return storage Url");
        }

        return {
          eTag: data.ETag,
          url: data.Location
        };
      })
      .nodeify(callback);
  }

  function validateOptions (options) {

    if (!options.accessKeyId) {
      throw Error("No AWS 'accessKeyId' provided");
    }

    if (!options.secretAccessKey) {
      throw Error("No AWS 'secretAccessKey' provided");
    }

    if (!options.region) {
      throw Error("No AWS S3 'region' provided");
    }

    if (!options.bucket) {
      throw Error("No AWS S3 'bucket' provided");
    }
  }

  return {
    put: put
  };
}

module.exports = storageProvider;