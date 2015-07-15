var should = require('chai').should;
var expect = require('chai').expect;
var storage = require('../main');

var InvalidArgumentError = storage.InvalidArgumentError;

describe('Remove', function() {

    it('should throw an InvalidArgumentError if path is a number', function () {

        expect(function () {
            return storage.remove(123);
        }).to.throw(InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is an object', function () {

        expect(function () {
            return storage.remove({});
        }).to.throw(InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is an array', function () {

        expect(function () {
            return storage.remove([]);
        }).to.throw(InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is null', function () {

        expect(function () {
            return storage.remove(null);
        }).to.throw(InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is undefined', function () {

        expect(function () {
            return storage.remove(undefined);
        }).to.throw(InvalidArgumentError);
    });
});