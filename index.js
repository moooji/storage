const fs = require("fs");
const is = require("valido");
const createError = require("@moooji/error-builder");
const { Storage: GCS } = require("@google-cloud/storage");

/**
 * Factory that returns a Storage instance
 *
 * @param {object} options Options
 * @returns {Storage}
 */
function create(bucket, options) {
  return new Storage(bucket, options);
}

function Storage(bucket, options = {}) {
  this.BAD_REQUEST = "storage/bad-request";
  this.STORAGE_EXCEPTION = "storage/storage-exception";

  if (!is.string(bucket)) {
    throw createError("Invalid bucket name", this.BAD_REQUEST);
  }

  this.client = options.client || new GCS();
  this.bucket = this.client.bucket(bucket);
  this.baseUrl = "https://storage.googleapis.com";
}

/**
 * Stores a buffer as object in Storage
 *
 * @param {string} key - Key
 * @param {Buffer} buffer - Buffer
 * @param {string} mimeType - MIME type
 * @param {number} cacheMaxAge - Cache Max Age
 * @param {boolean} gzip - Use GZIP compression
 * @param {boolean} resumable - Resumable upload
 * @returns {Promise}
 */
Storage.prototype.save = async function save(
  key,
  buffer,
  mimeType,
  cacheMaxAge,
  gzip = true,
  resumable = true
) {
  if (!is.string(key)) {
    throw createError("No valid key provided", this.BAD_REQUEST);
  }

  if (!is.buffer(buffer)) {
    throw createError("No buffer provided", this.BAD_REQUEST);
  }

  if (!is.string(mimeType)) {
    throw createError("No valid mime type provided", this.BAD_REQUEST);
  }

  if (cacheMaxAge && !is.natural(cacheMaxAge)) {
    throw createError("Invalid cache max-age provided", this.BAD_REQUEST);
  }

  try {
    const file = this.bucket.file(key);

    const metadata = {
      contentType: mimeType,
    };

    if (cacheMaxAge) {
      metadata.cacheControl = `max-age=${cacheMaxAge}`;
    }

    await file.save(buffer, {
      metadata,
      gzip,
      resumable,
      validation: "crc32c",
    });

    return `${this.baseUrl}/${this.bucket.name}/${key}`;
  } catch (err) {
    throw createError(err.message, this.STORAGE_EXCEPTION);
  }
};

/**
 * Streams a local file to Storage
 *
 * @param {string} key - Key
 * @param {string} path - Path
 * @param {string} mimeType - MIME type
 * @param {number} cacheMaxAge - Cache Max Age
 * @param {boolean} gzip - Use GZIP compression
 * @param {boolean} resumable - Resumable upload
 * @returns {Promise}
 */
Storage.prototype.upload = async function upload(
  key,
  path,
  mimeType,
  cacheMaxAge = 31536000,
  gzip = true,
  resumable = true
) {
  if (!is.string(key)) {
    throw createError("No valid key provided", this.BAD_REQUEST);
  }

  if (!is.string(path)) {
    throw createError("No path provided", this.BAD_REQUEST);
  }

  if (!is.string(mimeType)) {
    throw createError("No valid mime type provided", this.BAD_REQUEST);
  }

  if (cacheMaxAge && !is.natural(cacheMaxAge)) {
    throw createError("Invalid cache max-age provided", this.BAD_REQUEST);
  }

  try {
    const file = this.bucket.file(key);

    const metadata = {
      contentType: mimeType,
    };

    if (cacheMaxAge) {
      metadata.cacheControl = `max-age=${cacheMaxAge}`;
    }

    const stream = file.createWriteStream({
      metadata,
      resumable,
      gzip,
      validation: "crc32c",
    });

    const storageUrl = await new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(stream)
        .on("error", err => {
          reject(err);
        })
        .on("finish", () => {
          resolve(`${this.baseUrl}/${this.bucket.name}/${key}`);
        });
    });

    return storageUrl;
  } catch (err) {
    throw createError(err.message, this.STORAGE_EXCEPTION);
  }
};

/**
 * Removes one or several objects from Storage
 *
 * @param {string|Array<string>} key - Key(s)
 * @returns {Promise}
 */
Storage.prototype.remove = async function remove(key) {
  let keys = null;

  if (is.string(key)) {
    keys = [key];
  } else if (is.all.string(key)) {
    keys = key;
  }

  if (!keys) {
    throw createError("No valid object keys provided", this.BAD_REQUEST);
  }

  return this.bucket.file(keys).delete();
};

/**
 * Downloads an objects from Storage
 *
 * @param {string} key - Key
 * @param {string} path - Local path
 * @returns {Promise}
 */
Storage.prototype.download = async function download(key, path) {
  if (!key) {
    throw createError("No valid object key provided", this.BAD_REQUEST);
  }

  if (!path) {
    throw createError("No valid path provided", this.BAD_REQUEST);
  }

  try {
    await new Promise((resolve, reject) => {
      this.bucket
        .file(key)
        .createReadStream()
        .on("error", err => {
          reject(err);
        })
        .on("end", () => {
          resolve();
        })
        .pipe(fs.createWriteStream(path));
    });
  } catch (err) {
    throw createError(err.message, this.STORAGE_EXCEPTION);
  }
};

/**
 * Gets an object's MD5 content hash
 *
 * @param {string} key - Key
 * @returns {Promise}
 */
Storage.prototype.getMd5 = async function getMd5(key) {
  if (!key) {
    throw createError("No valid object key provided", this.BAD_REQUEST);
  }

  const [metadata] = await this.bucket.file(key).getMetadata();
  return metadata.md5Hash;
};

module.exports = create;
