'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk');

/**
 * Creates new S3 instance, or returns provided one
 *
 * @param {object} options - Options
 * @returns {AWS.S3} - S3 instance
 */
function create(options) {
  if (!_.isPlainObject(options)) {
    throw new TypeError('Invalid AWS options');
  }

  const hasAwsOptions = _.isString(options.region) &&
    _.isString(options.accessKeyId) &&
    _.isString(options.secretAccessKey);

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
