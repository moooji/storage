"use strict";

const should = require('chai').should;
const expect = require('chai').expect;
const storageProvider = require('../main');


describe('Put', function() {

    let storage = null;

    before(function() {

        storage = storageProvider({
            accessKeyId: "accessKeyId",
            secretAccessKey: "secretAccessKey",
            region: "region",
            bucket: "bucket"
        });
    });

    after(function() {
        storage = null;
    });

    it('should throw an InvalidArgumentError if path is a number', function () {

        expect(function () {
            return storage.put(123);
        }).to.throw(storage.InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is an object', function () {

        expect(function () {
            return storage.put({});
        }).to.throw(storage.InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is an array', function () {

        expect(function () {
            return storage.put([]);
        }).to.throw(storage.InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is null', function () {

        expect(function () {
            return storage.put(null);
        }).to.throw(storage.InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is undefined', function () {

        expect(function () {
            return storage.put(undefined);
        }).to.throw(storage.InvalidArgumentError);
    });
});