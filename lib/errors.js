const createError = require('custom-error-generator');

const StorageError = createError('StorageError');
const InvalidArgumentError = createError('InvalidArgumentError');

module.exports.StorageError = StorageError;
module.exports.InvalidArgumentError = InvalidArgumentError;
