const crypto = require('crypto');
const Joi = require('joi');
const is = require('valido');
const AWS = require('aws-sdk');
const hash = require('@moooji/hash');
const createError = require('custom-error-generator');

const optionsSchema = Joi.object().keys({
  accessKeyId: Joi.string().required(),
  secretAccessKey: Joi.string().required(),
  bucket: Joi.string().required(),
  region: Joi.string().required(),
  client: [Joi.object(), Joi.func()],
}).required();

/**
 * Storage Client constructor
 *
 * @param {object} options - S3 options
 * @constructor
 */
function StorageClient(options) {
  Joi.assert(options, optionsSchema);

  const {
    region,
    accessKeyId,
    secretAccessKey,
    bucket,
    client,
  } = options;

  this.bucket = bucket;
  this.client = client || new AWS.S3({ region, accessKeyId, secretAccessKey });
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
StorageClient.prototype.save = function save(key, buffer, mimeType, maxAge, isPublic) {
  return new Promise((resolve, reject) => {
    const checksum = this.getChecksum(buffer);

    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ACL: isPublic ? 'public-read' : 'private',
      ContentType: mimeType,
      ContentMD5: hash(buffer, "base64"),
    };

    if (maxAge) {
      params.CacheControl = `max-age=${maxAge}`;
    }

    return this.client.upload(params, (err, res) => {
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
StorageClient.prototype.remove = function remove(keys) {
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
        return reject(new this.StorageError('S3 did not return valid deletion result'));
      }

      const deletedPaths = res.Deleted.map(item => item.Key);
      return resolve({ paths: deletedPaths });
    });
  });
};

module.exports = StorageClient;
