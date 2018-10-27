const AWS = require("aws-sdk");
const hash = require("@moooji/hash");
const createError = require("@moooji/error-builder");

/**
 * Storage Client constructor
 *
 * @param {string} bucket - Bucket name
 * @param {object} options - S3 options
 * @param {object} [client] - S3 client instance
 * @constructor
 */
function StorageClient(bucket, options, client) {
  this.bucket = bucket;
  this.client = client || new AWS.S3(options);
  this.STORAGE_EXCEPTION = "storage/storage-exception";
}

/**
 * Stores a buffer as object in S3
 *
 * @param {string} key - Key
 * @param {Buffer} buffer - Buffer
 * @param {string} mimeType - MIME type
 * @returns {Promise}
 */
StorageClient.prototype.save = function save(
  key,
  buffer,
  mimeType,
  cacheMaxAge,
  isPublic
) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ACL: isPublic ? "public-read" : "private",
      ContentMD5: hash(buffer, "md5", "base64"),
      ContentType: mimeType
    };

    if (cacheMaxAge) {
      params.CacheControl = `max-age=${cacheMaxAge}`;
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
      RequestPayer: "requester",
      Delete: {
        Objects: objects,
        Quiet: false
      },
    };

    return this.client.deleteObjects(params, (err, res) => {
      if (err) {
        return reject(err);
      }

      if (!res || !res.Deleted) {
        return reject(
          createError(this.STORAGE_EXCEPTION, "S3 returned invalid result")
        );
      }

      const deletedPaths = res.Deleted.map(item => item.Key);
      return resolve({ paths: deletedPaths });
    });
  });
};

/**
 * Downloads an object from S3
 *
 * @param {string} key - Key
 * @param {string} path - Local path
 * @returns {Promise}
 */
StorageClient.prototype.download = async function download(key, path) {
  throw new Error("Not implemented");
};

/**
 * Gets the file's MD5 content hash
 *
 * @param {string} key - Key
 * @returns {Promise}
 */
StorageClient.prototype.getMd5 = async function getMd5(key) {
  throw new Error("Not implemented");

  /*
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: this.bucket,
      Key: key
    };

    this.client.headObject(params, (err, res) => {
      if (err) {
        return reject(err);
      }

      //... Extract MD5 from res
      return resolve();
    });
  });*/
};

module.exports = StorageClient;
