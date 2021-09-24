import { expect, should } from "chai";
import { describe, it } from "mocha";
import request from "supertest";
const app = require("../src/app");

describe("[MASTER_1]: 관리자 로그인", () => {
  const url = "/adm/auth";
  it("Invalid Key", (done) => {
    request(app)
      .post(url)
      .send({ k: "1234" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.token).to.be.equal("");
        expect(res.body.code).to.be.equal(-1);
        done();
      });
  });
  it("Correct Key", (done) => {
    request(app)
      .post(url)
      .send({ k: "3353" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.token).to.be.exist;
        expect(res.body.code).to.be.equal(-1);
        done();
      });
  });
});
