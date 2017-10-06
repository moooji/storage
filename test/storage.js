"use strict";

const sinon = require("sinon");
const chai = require("chai");
const expect = require("chai").expect;
const chaiAsPromised = require("chai-as-promised");
const createStorage = require("../index");
const S3 = require("../lib/s3");
const GCS = require("../lib/gcs");

chai.use(chaiAsPromised);

/**
 * Create
 */
describe("Storage - Create", () => {
  it("should throw TypeError if no options are provided", () => {
    expect(() => createStorage()).to.throw(TypeError);
  });

  it("should throw TypeError if S# and GCS options are provided", () => {
    const s3 = {
      accessKeyId: "accessKeyId",
      secretAccessKey: "secretAccessKey",
      region: "region",
      bucket: "bucket"
    };

    const gcs = {
      accessKeyId: "accessKeyId",
      secretAccessKey: "secretAccessKey",
      region: "region",
      bucket: "bucket"
    };

    expect(() => createStorage({ s3, gcs })).to.throw(TypeError);
  });

  it("should throw TypeError if S3 options are invalid", () => {
    const options = {
      accessKeyId: 123,
      secretAccessKey: "secretAccessKey",
      region: "region",
      bucket: "bucket"
    };

    expect(() => createStorage({ s3: options })).to.throw(TypeError);
  });

  it("should create storage instance with S3 client", () => {
    const options = {
      accessKeyId: "accessKeyId",
      secretAccessKey: "secretAccessKey",
      region: "region",
      bucket: "bucket"
    };

    const storage = createStorage({ s3: options });

    expect(storage.client).to.be.instanceof(S3);
  });

  it("should throw TypeError if GCS options are invalid", () => {
    const options = {
      accessKeyId: 123,
      secretAccessKey: "secretAccessKey",
      region: "region",
      bucket: "bucket"
    };

    expect(() => createStorage({ gcs: options })).to.throw(TypeError);
  });

  it("should create storage instance with GCS client", () => {
    const options = {
      accessKeyId: "accessKeyId",
      secretAccessKey: "secretAccessKey",
      region: "region",
      bucket: "bucket"
    };

    const storage = createStorage({ gcs: options });

    expect(storage.client).to.be.instanceof(GCS);
  });
});

/**
 * Put
 */
describe("Storage - Put", () => {
  let storage = null;

  before(() => {
    const client = {};
    client.put = sinon.stub();
    storage = createStorage({ client });
  });

  it("should throw TypeError if no key is provided", () => {
    return expect(storage.put())
      .to.be.rejectedWith(TypeError)
      .then(() => {
        expect(storage.client.put.callCount).to.equal(0);
      });
  });

  it("should throw TypeError if invalid key is provided", () => {
    return expect(storage.put(123))
      .to.be.rejectedWith(TypeError)
      .then(() => {
        expect(storage.client.put.callCount).to.equal(0);
      });
  });

  it("should store object with key", () => {
    const key = "abc";

    return expect(storage.put(key)).to.be.eventually.fulfilled.then(() => {
      expect(storage.client.put.calledWith(key)).to.equal(true);
    });
  });

  it("should be rejected with Storage error if files cannot be stored", () => {
    const key = "abc";
    const errorClient = {};

    errorClient.remove = () => {
      throw Error('Failed');
    }

    storage = createStorage({ client: errorClient });

    return expect(storage.put(key)).to.be.rejectedWith(storage.StorageError)
  });
});

/**
 * Remove
 */
describe("Storage - Remove", () => {
  let storage = null;

  before(() => {
    const client = {};
    client.remove = sinon.stub();
    storage = createStorage({ client });
  });

  it("should throw TypeError if no keys are provided", () => {
    return expect(storage.remove())
      .to.be.rejectedWith(TypeError)
      .then(() => {
        expect(storage.client.remove.callCount).to.equal(0);
      });
  });

  it("should throw TypeError if invalid keys are provided", () => {
    return expect(storage.remove(123))
      .to.be.rejectedWith(TypeError)
      .then(() => {
        expect(storage.client.remove.callCount).to.equal(0);
      });
  });

  it("should remove object with key", () => {
    const key = "abc";

    return expect(storage.remove(key)).to.be.eventually.fulfilled.then(() => {
      expect(storage.client.remove.calledWith([key])).to.equal(true);
    });
  });

  it("should remove list of objects", () => {
    const keys = ["abc", "cde"];

    return expect(storage.remove(keys)).to.be.eventually.fulfilled.then(() => {
      expect(storage.client.remove.calledWith(keys)).to.equal(true);
    });
  });

  it("should be rejected with Storage error if files cannot be removed", () => {
    const keys = "abc";
    const errorClient = {};

    errorClient.remove = () => {
      throw Error('Failed');
    }

    storage = createStorage({ client: errorClient });

    return expect(storage.remove(keys)).to.be.rejectedWith(storage.StorageError)
  });
});
