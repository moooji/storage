const crypto = require('crypto');
const joi = require('joi');
const is = require('valido');
const AWS = require('aws-sdk');
const hash = require('@moooji/hash');
const createError = require('custom-error-generator');

const schema = joi.object().keys({
  accessKeyId: joi.string().required(),
  secretAccessKey: joi.string().required(),
  bucket: joi.string().required(),
  region: joi.string().required(),
  acl: joi.string().default('private'),
  client: [joi.object(), joi.func()],
});

/**
 * S3 constructor
 *
 * @param {object} options - S3 options
 * @constructor
 */
function S3(options) {
  const validation = schema.validate(options);

  if (validation.error) {
    throw new TypeError('Invalid options');
  }

  const {
    region,
    accessKeyId,
    secretAccessKey,
    bucket,
    acl,
    client,
  } = validation.value;

  this.acl = acl;
  this.bucket = bucket;
  this.client = client || new AWS.S3({ region, accessKeyId, secretAccessKey });
  this.S3Error = createError('S3Error');
}

/**
 * Stores a buffer as object in S3
 *
 * @param {Buffer} buffer - Buffer
 * @param {string} path - Path
 * @param {string} mimeType - MIME type
 * @returns {Promise}
 */
S3.prototype.put = function put(buffer, path, mimeType) {
  return new Promise((resolve, reject) => {
    const checksum = this.getChecksum(buffer);

    const params = {
      Bucket: this.bucket,
      Key: path,
      Body: buffer,
      ACL: this.acl,
      ContentType: mimeType,
      ContentMD5: checksum.base64,
    };

    return this.client.upload(params, (err, res) => {
      if (err) {
        return reject(err);
      }

      if (res.ETag !== checksum.eTag) {
        return reject(new this.S3Error('ETag does not match buffer MD5 hash'));
      }

      if (!is.uri(res.Location)) {
        return reject(new this.S3Error('S3 did not return valid storage URL'));
      }

      return resolve({
        eTag: res.ETag,
        url: res.Location,
      });
    });
  });
};

/**
 * Removes one or several objects from S3
 *
 * @param {string|Array<String>} paths - Paths
 * @returns {Promise}
 */
S3.prototype.remove = function remove(keys) {
  return new Promise((resolve, reject) => {
    const objects = keys.map(key => {
      return { Key: key };
    });

    const params = {
      Bucket: this.bucket,
      Delete: {
        Objects: objects,
        Quiet: false,
      },
      RequestPayer: 'requester',
    };

    return this.client.deleteObjects(params, (err, res) => {
      if (err) {
        return reject(err);
      }

      if (!res || !res.Deleted) {
        return reject(new this.S3Error('S3 did not return valid deletion result'));
      }

      const deletedPaths = res.Deleted.map(item => item.Key);
      return resolve({ paths: deletedPaths });
    });
  });
};

/**
 * Gets checksum and eTag for a buffer
 *
 * @param {Buffer} buffer - Buffer
 * @returns {object}
 */
S3.prototype.getChecksum = function getChecksum(buffer) {
  if (!is.buffer(buffer)) {
    throw new TypeError('No valid buffer');
  }

  const base64 = hash(buffer, 'base64');
  const eTag = `"${new Buffer(base64, 'base64').toString('hex')}"`;

  return { base64, eTag };
};

module.exports = S3;
