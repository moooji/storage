var should = require('chai').should;
var expect = require('chai').expect;
var storage = require('../main');

var InvalidArgumentError = storage.InvalidArgumentError;

describe('Put', function() {

    it('should throw an InvalidArgumentError if path is a number', function () {

        expect(function () {
            return storage.put(123);
        }).to.throw(InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is an object', function () {

        expect(function () {
            return storage.put({});
        }).to.throw(InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is an array', function () {

        expect(function () {
            return storage.put([]);
        }).to.throw(InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is null', function () {

        expect(function () {
            return storage.put(null);
        }).to.throw(InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is undefined', function () {

        expect(function () {
            return storage.put(undefined);
        }).to.throw(InvalidArgumentError);
    });
});