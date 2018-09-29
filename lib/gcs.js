const hash = require('@moooji/hash');
const createError = require('@moooji/error-builder');
const { Storage: GCS } = require('@google-cloud/storage');

/**
 * Storage Client constructor
 *
 * @param {string} bucket - Bucket name
 * @param {object} options - GCS options
 * @param {object} [client] - GCS client instance
 * @constructor
 */
function StorageClient(bucket, options, client) {
  this.client = client || new GCS(options);
  this.bucket = this.client.bucket(bucket);
  this.baseUrl = 'https://storage.googleapis.com';
  this.STORAGE_EXCEPTION = 'storage/storage-exception';
}

/**
 * Stores a buffer as object in GCS
 *
 * @param {string} key - Key
 * @param {Buffer} buffer - Buffer
 * @param {string} mimeType - MIME type
 * @returns {Promise}
 */
StorageClient.prototype.save = async function save(key, buffer, mimeType, cacheMaxAge, isPublic) {
  try {
    const file = this.bucket.file(key);

    const metadata = {
      md5Hash: hash(buffer, "md5", "base64"),
      contentType: mimeType,
    }

    if (cacheMaxAge) {
      metadata.cacheControl = `max-age=${cacheMaxAge}`;
    }

    await file.save(buffer, { metadata });

    if (isPublic) {
	    await file.makePublic();
    }

    return `${this.baseUrl}/${this.bucket.name}/${key}`;
  } catch(err) {
    throw createError(this.STORAGE_EXCEPTION, err.message);
  }
};

/**
 * Removes one or several objects from GCS
 *
 * @param {string|Array<String>} keys - Keys
 * @returns {Promise}
 */
StorageClient.prototype.remove = async function remove(keys) {
  return this.bucket.file(keys).delete();
};

module.exports = StorageClient;
