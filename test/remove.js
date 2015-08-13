"use strict";

const should = require('chai').should;
const expect = require('chai').expect;
const storageProvider = require('../main');

describe('Remove', function() {

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
            return storage.remove(123);
        }).to.throw(storage.InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is an object', function () {

        expect(function () {
            return storage.remove({});
        }).to.throw(storage.InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is an empty array', function () {

        expect(function () {
            return storage.remove([]);
        }).to.throw(storage.InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is an non string array', function () {

        expect(function () {
            return storage.remove(["abc", 123, {}]);
        }).to.throw(storage.InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is null', function () {

        expect(function () {
            return storage.remove(null);
        }).to.throw(storage.InvalidArgumentError);
    });

    it('should throw an InvalidArgumentError if path is undefined', function () {

        expect(function () {
            return storage.remove(undefined);
        }).to.throw(storage.InvalidArgumentError);
    });
});