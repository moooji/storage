'use strict';var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var Joi = require('joi');
var is = require('valido');
var S3 = require('./lib/s3');
var GCS = require('./lib/gcs');

var optionsSchema = Joi.alternatives().try(
Joi.object().keys({
  s3: Joi.object().required() }),

Joi.object().keys({
  gcs: Joi.object().required() }),

Joi.object().keys({
  client: Joi.object().required() })).

required();

/**
             * Factory that returns a Storage instance
             *
             * @param {object} options Options
             * @returns {Storage}
             */
function create(options) {
  return new Storage(options);
}

function Storage(options) {
  Joi.assert(options, optionsSchema);

  if (options.client) {
    this.client = options.client;
  } else if (options.s3) {
    this.client = new S3(options.s3);
  } else if (options.gcs) {
    this.client = new GCS(options.gcs);
  }

  this.StorageError = this.client.StorageError;
}

/**
   * Stores a buffer as object in Storage
   *
   * @param {string} key - Key
   * @param {Buffer} buffer - Buffer
   * @param {string} mimeType - MIME type
   * @returns {Promise}
   */
Storage.prototype.save = function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(key, buffer, mimeType) {var isPublic = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:if (
            is.string(key)) {_context.next = 2;break;}throw (
              new TypeError('No valid key provided'));case 2:if (


            is.buffer(buffer)) {_context.next = 4;break;}throw (
              new TypeError('No buffer provided'));case 4:if (


            is.string(mimeType)) {_context.next = 6;break;}throw (
              new TypeError('No valid mime type provided'));case 6:_context.prev = 6;_context.next = 9;return (



              this.client.save(key, buffer, mimeType, isPublic));case 9:_context.next = 14;break;case 11:_context.prev = 11;_context.t0 = _context['catch'](6);throw (

              new this.StorageError('Could not store object [' + key + '] - ' + _context.t0.message));case 14:case 'end':return _context.stop();}}}, _callee, this, [[6, 11]]);}));function save(_x, _x2, _x3) {return _ref.apply(this, arguments);}return save;}();



/**
                                                                                                                                                                                                                                                                      * Removes one or several objects from Storage
                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                      * @param {string|Array<string>} key - Key(s)
                                                                                                                                                                                                                                                                      * @returns {Promise}
                                                                                                                                                                                                                                                                      */
Storage.prototype.remove = function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(key) {var keys;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:
            keys = null;

            if (is.string(key)) {
              keys = [key];
            } else if (is.all.string(key)) {
              keys = key;
            }if (

            keys) {_context2.next = 4;break;}throw (
              new TypeError('No valid object keys provided'));case 4:_context2.prev = 4;_context2.next = 7;return (



              this.client.remove(keys));case 7:_context2.next = 12;break;case 9:_context2.prev = 9;_context2.t0 = _context2['catch'](4);throw (

              new this.StorageError('Could not remove object(s) ' + keys + ' - ' + _context2.t0.message));case 12:case 'end':return _context2.stop();}}}, _callee2, this, [[4, 9]]);}));function remove(_x5) {return _ref2.apply(this, arguments);}return remove;}();



module.exports = create;