"use strict";

const fs = require("fs");
const path = require("path");
const sinon = require("sinon");
const chai = require("chai");
const expect = require("chai").expect;
const chaiAsPromised = require("chai-as-promised");
const { Storage: GCS } = require("@google-cloud/storage");

const createStorage = require("../index");

chai.use(chaiAsPromised);

function readFile(relPath) {
  return fs.readFileSync(path.join(__dirname, relPath));
}

/**
 * Create
 */
describe("Storage - Create", () => {
  it("should throw with code 'storage/bad-request' if no bucket name is supplied", () => {
    expect(() => createStorage(null))
      .to.throw(Error)
      .that.has.property("code")
      .that.equals("storage/bad-request");
  });

  it("should create storage instance with GCS client", () => {
    const options = {
      projectId: "projectId",
      bucket: "bucket"
    };

    const storage = createStorage("bucket", options);
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
    client.bucket = sinon.stub();
    storage = createStorage("bucket", { client });
  });

  it("should throw storage/bad-request if no key is provided", () => {
    const key = null;
    const buffer = readFile("./assets/image.jpg");
    const mimeType = "image/jpeg";

    return expect(storage.save(key, buffer, mimeType))
      .to.be.rejectedWith(Error);
  });

  it("should throw storage/bad-request if invalid key is provided", () => {
    const key = 123;
    const buffer = readFile("./assets/image.jpg");
    const mimeType = "image/jpeg";

    return expect(storage.save(key, buffer, mimeType))
      .to.be.rejectedWith(Error);
  });

  it("should throw storage/bad-request if invalid max-age is provided", () => {
    const key = "abc";
    const buffer = readFile("./assets/image.jpg");
    const mimeType = "image/jpeg";
    const cacheMaxAge = "abc";

    return expect(storage.save(key, buffer, mimeType, cacheMaxAge))
      .to.be.rejectedWith(Error);
  });
});

/**
 * Remove
 */
describe("Storage - Remove", () => {
  let storage = null;

  before(() => {
    const client = {};
    client.bucket = sinon.stub();
    storage = createStorage("bucket", { client });
  });

  it("should throw storage/bad-request if no keys are provided", () => {
    return expect(storage.remove())
      .to.be.rejectedWith(Error);
  });

  it("should throw storage/bad-request if invalid keys are provided", () => {
    return expect(storage.remove(123))
      .to.be.rejectedWith(Error);
  });
});
