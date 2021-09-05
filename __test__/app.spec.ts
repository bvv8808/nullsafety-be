import { expect, should } from "chai";
import { describe, it } from "mocha";
import request from "supertest";
const app = require("../src/app");

describe("[Invalid URL]", () => {
  it("GET: Invalid URL", () => {
    request(app)
      .get("/invalid")
      .expect(404)
      .end((err, res) => {
        expect(res.text).to.equal("404 Not Found");
      });
  });
  it("POST: Invalid URL", () => {
    request(app)
      .post("/invalid")
      .expect(404)
      .end((err, res) => {
        expect(res.text).to.equal("404 Not Found");
      });
  });
});

describe("[Basic App]", () => {
  it("GET: /", () => {
    request(app)
      .get("/")
      .expect(200)
      .end((err, res) => {
        expect(res.text).to.equal("Hello");
      });
  });
});
