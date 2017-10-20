'use strict';var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var crypto = require('crypto');
var Joi = require('joi');
var is = require('valido');
var hash = require('@moooji/hash');
var GCS = require('@google-cloud/storage');
var createError = require('custom-error-generator');

var optionsSchema = Joi.object().keys({
  projectId: Joi.string().required(),
  bucket: Joi.string().required(),
  credentials: Joi.object(),
  client: [Joi.object(), Joi.func()] }).
required();

/**
             * Storage Client constructor
             *
             * @param {object} options - GCS options
             * @constructor
             */
function StorageClient(options) {
  Joi.assert(options, optionsSchema);var


  projectId =


  options.projectId,bucket = options.bucket,client = options.client;

  this.client = client || GCS(options);
  this.bucket = this.client.bucket(bucket);
  this.StorageError = createError('StorageError');
}

/**
   * Stores a buffer as object in GCS
   *
   * @param {string} key - Key
   * @param {Buffer} buffer - Buffer
   * @param {string} mimeType - MIME type
   * @returns {Promise}
   */
StorageClient.prototype.save = function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(key, buffer, mimeType) {var isPublic = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;var file, metadata;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.prev = 0;if (

            is.string(key)) {_context.next = 3;break;}throw (
              new TypeError('No valid key provided'));case 3:if (


            is.buffer(buffer)) {_context.next = 5;break;}throw (
              new TypeError('No buffer provided'));case 5:if (


            is.string(mimeType)) {_context.next = 7;break;}throw (
              new TypeError('No valid mime type provided'));case 7:


            file = this.bucket.file(key);

            metadata = {
              md5Hash: hash(buffer, "base64"),
              contentType: mimeType };


            if (isPublic) {
              metadata.acl = [
              {
                entity: 'allUsers',
                role: this.client.acl.READER_ROLE }];


            }_context.next = 12;return (

              file.save(buffer, { metadata: metadata }));case 12:_context.next = 17;break;case 14:_context.prev = 14;_context.t0 = _context['catch'](0);throw (

              new this.StorageError('Could not store object in GCS bucket - ' + _context.t0.message));case 17:case 'end':return _context.stop();}}}, _callee, this, [[0, 14]]);}));function save(_x, _x2, _x3) {return _ref.apply(this, arguments);}return save;}();



/**
                                                                                                                                                                                                                                                                      * Removes one or several objects from GCS
                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                      * @param {string|Array<String>} keys - Keys
                                                                                                                                                                                                                                                                      * @returns {Promise}
                                                                                                                                                                                                                                                                      */
StorageClient.prototype.remove = function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(keys) {return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:case 'end':return _context2.stop();}}}, _callee2, this);}));function remove(_x5) {return _ref2.apply(this, arguments);}return remove;}();



module.exports = StorageClient;