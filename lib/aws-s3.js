'use strict';

const is = require('valido');
const AWS = require('aws-sdk');

/**
 * Creates new S3 instance, or returns provided one
 *
 * @param {object} options - Options
 * @returns {AWS.S3} - S3 instance
 */
function create(options) {
  if (!is.plainObject(options)) {
    throw new TypeError('Invalid AWS options');
  }

  const hasAwsOptions = is.string(options.region) &&
    is.string(options.accessKeyId) &&
    is.string(options.secretAccessKey);

  if (!options.s3 && !hasAwsOptions) {
    throw new TypeError('Invalid AWS options');
  }

  return options.s3 || new AWS.S3({
    region: options.region,
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
  });
}

module.exports.create = create;
