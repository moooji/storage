const crypto = require('crypto');
const errors = require('./errors');

const InvalidArgumentError = errors.InvalidArgumentError;

function md5(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new InvalidArgumentError('No valid buffer');
  }

  // Calculate MD5 checksum of buffer
  // Amazon S3 will cross-check and return an error
  // if checksum of stored file does not match
  const bufferHash = crypto.createHash('md5');
  bufferHash.update(buffer);

  const base64 = bufferHash.digest('base64');
  const eTag = '"' + new Buffer(base64, 'base64').toString('hex') + '"';

  return { base64, eTag };
}

module.exports = md5;
