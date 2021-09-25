import { expect, should } from "chai";
import { describe, it } from "mocha";
import request from "supertest";
import { TCategoryDetail } from "../src/lib/types";
const app = require("../src/app");

describe("[MASTER_1]: 관리자 로그인", () => {
  const url = "/adm/auth";
  it("Invalid Key", (done) => {
    request(app)
      .post(url)
      .send({ k: "1234" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.token).to.be.equal(null);
        expect(res.body.code).to.be.equal(1);
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
        expect(res.body.code).to.be.equal(0);

        done();
      });
  });
});

describe("[CATEGORY_2]: 전체 카테고리의 상세 정보", () => {
  const url = "/adm/category";
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiIzMzUzIiwiaWF0IjoxNjMyNTc3MDk5LCJleHAiOjE2MzI2NjM0OTl9.FdFwc6XfXKAQE1CWn6dlofw-H_L9GXYWkk7LhQEwIoc";
  it("Correct token", (done) => {
    request(app)
      .get(url)
      .set("Cookie", `token=${token}`)
      .end((err, res) => {
        const categories: TCategoryDetail[] = res.body.categories;
        expect(categories).to.be.instanceOf(Array);

        if (categories.length) {
          expect(categories[0].id).to.be.exist;
          expect(categories[0].name).to.be.exist;
          expect(categories[0].priority).to.be.exist;
        }
        done();
      });
  });

  it("Missing token", (done) => {
    request(app)
      .get(url)
      // .set('Cookie', `token=${token}`)
      .end((err, res) => {
        const categories: TCategoryDetail[] = res.body.categories;
        expect(categories).to.be.instanceOf(Array);
        expect(categories.length).to.be.equal(0);
        done();
      });
  });
});
