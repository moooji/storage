"use strict";

const fs = require("fs");
const path = require("path");
const Joi = require('joi');
const sinon = require("sinon");
const chai = require("chai");
const expect = require("chai").expect;
const chaiAsPromised = require("chai-as-promised");
const createError = require('custom-error-generator');

const createStorage = require("../src/index");
const S3 = require("../src/lib/s3");
const GCS = require("../src/lib/gcs");

chai.use(chaiAsPromised);

function readFile(relPath) {
  return fs.readFileSync(path.join(__dirname, relPath));
}

/**
 * Create
 */
describe("Storage - Create", () => {
  it("should throw ValidationError if no options are provided", () => {
    expect(() => createStorage()).to.throw().with.property('isJoi', true);
  });

  it("should throw ValidationError if no S3 or GCS options are provided", () => {
    expect(() => createStorage({})).to.throw().with.property('isJoi', true);
  });

  it("should throw ValidationError if S3 and GCS options are provided", () => {
    const s3 = {
      accessKeyId: "accessKeyId",
      secretAccessKey: "secretAccessKey",
      region: "region",
      bucket: "bucket"
    };

    const gcs = {
      projectId: "projectId",
      bucket: "bucket"
    };

    expect(() => createStorage({ s3, gcs })).to.throw().with.property('isJoi', true);
  });

  it("should throw ValidationError if S3 options are invalid", () => {
    const options = {
      accessKeyId: 123,
      secretAccessKey: "secretAccessKey",
      region: "region",
      bucket: "bucket"
    };

    expect(() => createStorage({ s3: options })).to.throw().with.property('isJoi', true);
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

  it("should throw ValidationError if GCS options are invalid", () => {
    const options = {
      projectId: 123,
      bucket: "bucket"
    };

    expect(() => createStorage({ gcs: options })).to.throw().with.property('isJoi', true);
  });

  it("should create storage instance with GCS client", () => {
    const options = {
      projectId: "projectId",
      bucket: "bucket"
    };

    const storage = createStorage({ gcs: options });

    expect(storage.client).to.be.instanceof(GCS);
  });
});

/**
 * Save
 */
describe("Storage - Save", () => {
  let storage = null;

  before(() => {
    const client = {};
    client.save = sinon.stub();
    client.remove = sinon.stub();
    storage = createStorage({ client });
  });

  it("should throw TypeError if no key is provided", () => {
    const key = null;
    const buffer = readFile("./assets/image.jpg");
    const mimeType = 'image/jpeg';

    return expect(storage.save(key, buffer, mimeType))
      .to.be.rejectedWith(TypeError)
      .then(() => {
        expect(storage.client.save.callCount).to.equal(0);
      });
  });

  it("should throw TypeError if invalid key is provided", () => {
    const key = 123;
    const buffer = readFile("./assets/image.jpg");
    const mimeType = 'image/jpeg';

    return expect(storage.save(key, buffer, mimeType))
      .to.be.rejectedWith(TypeError)
      .then(() => {
        expect(storage.client.save.callCount).to.equal(0);
      });
  });

  it("should store object with key", () => {
    const key = "abc";
    const buffer = readFile("./assets/image.jpg");
    const mimeType = 'image/jpeg';

    return expect(storage.save(key, buffer, mimeType)).to.be.eventually.fulfilled.then(() => {
      expect(storage.client.save.calledWith(key, buffer, mimeType)).to.equal(true);
    });
  });

  it("should be rejected with Storage error if files cannot be stored", () => {
    const key = "abc";
    const buffer = readFile("./assets/image.jpg");
    const mimeType = 'image/jpeg';
    const errorClient = { StorageError: createError('StorageError') };

    errorClient.save = (key, buffer) => {
      throw errorClient.StorageError('Failed');
    }

    storage = createStorage({ client: errorClient });

    return expect(storage.save(key, buffer, mimeType)).to.be.rejectedWith(storage.StorageError)
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
