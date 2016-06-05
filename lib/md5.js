const crypto = require('crypto');

function md5(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('No valid buffer');
  }

  // Calculate MD5 checksum of buffer
  // Amazon S3 will cross-check and return an error
  // if checksum of stored file does not match
  const bufferHash = crypto.createHash('md5');
  bufferHash.update(buffer);

  const base64 = bufferHash.digest('base64');
  const eTag = `"${new Buffer(base64, 'base64').toString('hex')}"`;

  return { base64, eTag };
}

module.exports = md5;
