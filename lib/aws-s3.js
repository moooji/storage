'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk');
const errors = require('./errors');
const InvalidArgumentError = errors.InvalidArgumentError;

/**
 * Creates new S3 instance, or returns provided one
 *
 * @param {object} options - Options
 * @returns {AWS.S3} - S3 instance
 */
function create(options) {
  if (!_.isPlainObject(options)) {
    throw new InvalidArgumentError('Invalid AWS options');
  }

  const hasAwsOptions = _.isString(options.region) &&
    _.isString(options.accessKeyId) &&
    _.isString(options.secretAccessKey);

  if (!options.s3 && !hasAwsOptions) {
    throw new InvalidArgumentError('Invalid AWS options');
  }

  return options.s3 || new AWS.S3({
      region: options.region,
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey
    });
}

module.exports.create = create;
