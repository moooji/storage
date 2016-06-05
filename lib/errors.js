const createError = require('custom-error-generator');
const StorageError = createError('StorageError');

module.exports.StorageError = StorageError;
