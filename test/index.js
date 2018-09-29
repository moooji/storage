"use strict";

const fs = require("fs");
const path = require("path");
const sinon = require("sinon");
const chai = require("chai");
const expect = require("chai").expect;
const chaiAsPromised = require("chai-as-promised");

const createStorage = require("../index");
const S3 = require("../lib/s3");
const GCS = require("../lib/gcs");

chai.use(chaiAsPromised);

function readFile(relPath) {
  return fs.readFileSync(path.join(__dirname, relPath));
}

/**
 * Create
 */
describe("Storage - Create", () => {
  it("should throw with code 'storage/invalid-bucket' if no bucket name is supplied", () => {
    expect(() => createStorage(null, "s3"))
      .to.throw(Error)
      .that.has.property("code")
      .that.equals("storage/invalid-bucket");
  });

  it("should throw with code 'storage/invalid-provider' for invalid provider", () => {
    expect(() => createStorage("bucket", "wrong-provider"))
      .to.throw(Error)
      .that.has.property("code")
      .that.equals("storage/invalid-provider");
  });

  it("should throw with code 'storage/invalid-client' if no provider nor client is supplied", () => {
    expect(() => createStorage("bucket", null, {}))
      .to.throw(Error)
      .that.has.property("code")
      .that.equals("storage/invalid-client");
  });

  it("should create storage instance with S3 client", () => {
    const options = {
      accessKeyId: "accessKeyId",
      secretAccessKey: "secretAccessKey",
      region: "region",
      bucket: "bucket"
    };

    const storage = createStorage("bucket", "s3", options);
    expect(storage.client).to.be.instanceof(S3);
  });

  it("should create storage instance with GCS client", () => {
    const options = {
      projectId: "projectId",
      bucket: "bucket"
    };

    const storage = createStorage("bucket", "gcs", options);
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
    storage = createStorage("bucket", null, {}, client);
  });

  it("should throw TypeError if no key is provided", () => {
    const key = null;
    const buffer = readFile("./assets/image.jpg");
    const mimeType = "image/jpeg";

    return expect(storage.save(key, buffer, mimeType))
      .to.be.rejectedWith(TypeError)
      .then(() => {
        expect(storage.client.save.callCount).to.equal(0);
      });
  });

  it("should throw TypeError if invalid key is provided", () => {
    const key = 123;
    const buffer = readFile("./assets/image.jpg");
    const mimeType = "image/jpeg";

    return expect(storage.save(key, buffer, mimeType))
      .to.be.rejectedWith(TypeError)
      .then(() => {
        expect(storage.client.save.callCount).to.equal(0);
      });
  });

  it("should throw TypeError if invalid max-age is provided", () => {
    const key = "abc";
    const buffer = readFile("./assets/image.jpg");
    const mimeType = "image/jpeg";
    const cacheMaxAge = "abc";

    return expect(storage.save(key, buffer, mimeType, cacheMaxAge))
      .to.be.rejectedWith(TypeError)
      .then(() => {
        expect(storage.client.save.callCount).to.equal(0);
      });
  });

  it("should store object with key", () => {
    const key = "abc";
    const buffer = readFile("./assets/image.jpg");
    const mimeType = "image/jpeg";

    return expect(
      storage.save(key, buffer, mimeType)
    ).to.be.eventually.fulfilled.then(() => {
      expect(storage.client.save.calledWith(key, buffer, mimeType)).to.equal(
        true
      );
    });
  });

  it("should store object with key and max age", () => {
    const key = "abc";
    const buffer = readFile("./assets/image.jpg");
    const mimeType = "image/jpeg";
    const cacheMaxAge = 86400;

    return expect(
      storage.save(key, buffer, mimeType, cacheMaxAge)
    ).to.be.eventually.fulfilled.then(() => {
      expect(
        storage.client.save.calledWith(key, buffer, mimeType, cacheMaxAge)
      ).to.equal(true);
    });
  });

  it("should be rejected with Storage exception if files cannot be stored", () => {
    const key = "abc";
    const buffer = readFile("./assets/image.jpg");
    const mimeType = "image/jpeg";
    const errorClient = {};

    errorClient.save = () => {
      throw new Error("Could not save file");
    };

    storage = createStorage("bucket", null, {}, errorClient);

    return storage
      .save(key, buffer, mimeType)
      .then(() => {
        throw new Error("This should not succeed");
      })
      .catch(err => expect(err.code).to.equal(storage.STORAGE_EXCEPTION));
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
    storage = createStorage("bucket", null, {}, client);
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
      throw Error("Failed");
    };

    storage = createStorage("bucket", null, {}, errorClient);

    return storage.remove(keys)
    .then(() => {
      throw new Error("This should not succeed");
    })
    .catch(err => expect(err.code).to.equal(storage.STORAGE_EXCEPTION));
  });
});
