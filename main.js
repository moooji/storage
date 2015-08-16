"use strict";

var crypto = require("crypto");
var Promise = require("bluebird");
var AWS = require("aws-sdk");
var _ = require("lodash");
var createError = require('custom-error-generator');

var StorageError = createError('StorageError');
var InvalidArgumentError = createError('InvalidArgumentError');

function storageProvider(options) {

    validateOptions(options);

    const s3 = new AWS.S3({
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
        region: options.region
    });

    const bucket = options.bucket;
    const acl = options.acl ? options.acl : "public-read";
    const uploadAsync = Promise.promisify(s3.upload, s3);
    const deleteAsync = Promise.promisify(s3.deleteObjects, s3);

    /**
     * Stores a buffer as object in storage
     * @param {Buffer }buffer
     * @param {String} path
     * @param {String} mimeType
     * @param {Function} [callback]
     * @returns {Promise}
     */
    function put(buffer, path, mimeType, callback) {

        return Promise.resolve(buffer).
            then(function(buffer) {

                if (!Buffer.isBuffer(buffer)) {
                    throw new InvalidArgumentError("No buffer provided");
                }

                if (!_.isString(path)) {
                    throw new InvalidArgumentError("No valid path provided");
                }

                if (!_.isString(mimeType)) {
                    throw new InvalidArgumentError("No valid mime type provided");
                }

                // Calculate MD5 checksum of buffer
                // Amazon S3 will cross-check and return an error
                // if checksum of stored file does not match
                let bufferHash = crypto.createHash('md5');
                bufferHash.update(buffer);

                const bufferHashBase64 = bufferHash.digest('base64');
                const eTag = '"' + Buffer(bufferHashBase64, 'base64').toString('hex') + '"';

                return {
                    Bucket: bucket,
                    Key: path,
                    Body: buffer,
                    ACL: acl,
                    ContentType: mimeType,
                    ContentMD5: bufferHashBase64
                };
            })
            .then(uploadAsync)
            .then(function (data) {

                if (data.ETag !== eTag) {
                    throw new StorageError("ETag does not match buffer MD5 hash");
                }

                if (!_.isString(data.Location)) {
                    throw new StorageError("S3 did not return storage Url");
                }

                return {
                    eTag: data.ETag,
                    url: data.Location
                };
            })
            .nodeify(callback);
    }

    /**
     * Removes one or several objects from storage
     * @param {String || [String]} paths
     * @param {Function} [callback]
     * @returns {Promise}
     */
    function remove(paths, callback) {

        let objects = [];

        if (_.isString(paths)) {

            // Build object and add to list
            objects.push({ Key: paths });

        }
        else if (_.isArray(paths) && paths.length) {

            // Ensure uniqueness
            paths = _.uniq(paths);

            // Iterate through paths
            // and ensure that they are strings
            for (let path of paths) {

                if (!_.isString(path)) {
                    throw new InvalidArgumentError("No valid path provided");
                }

                // Build object and add to list
                objects.push({ Key: path });
            }
        }
        else {
            throw new InvalidArgumentError("No valid path provided");
        }

        const params = {
            Bucket: bucket,
            Delete: {
                Objects: objects,
                Quiet: false
            },
            RequestPayer: 'requester'
        };

        return deleteAsync(params)
            .then(function (data) {

                if (!data || !data.Deleted) {
                    throw new StorageError("S3 did not return valid deletion result");
                }

                const paths = _.map(data.Deleted, function(item) {
                    return item.Key
                });

                return { paths: paths };
            })
            .nodeify(callback);
    }

    function validateOptions(options) {

        if (!options.accessKeyId) {
            throw new InvalidArgumentError("No AWS 'accessKeyId' provided");
        }

        if (!options.secretAccessKey) {
            throw new InvalidArgumentError("No AWS 'secretAccessKey' provided");
        }

        if (!options.region) {
            throw new InvalidArgumentError("No AWS S3 'region' provided");
        }

        if (!options.bucket) {
            throw new InvalidArgumentError("No AWS S3 'bucket' provided");
        }
    }

    return {
        put: put,
        remove: remove,
        InvalidArgumentError: InvalidArgumentError,
        StorageError: StorageError
    };
}

module.exports = storageProvider;