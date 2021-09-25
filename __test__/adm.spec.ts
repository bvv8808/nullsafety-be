import { expect, should } from "chai";
import { describe, it } from "mocha";
import request from "supertest";
import { TCategoryDetail } from "../src/lib/types";
const app = require("../src/app");

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiIzMzUzIiwiaWF0IjoxNjMyNTc3MDk5LCJleHAiOjE2MzI2NjM0OTl9.FdFwc6XfXKAQE1CWn6dlofw-H_L9GXYWkk7LhQEwIoc";

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
        console.log("Created key: ", res.body.token);

        expect(res.body.token).to.be.exist;
        expect(res.body.code).to.be.equal(0);

        done();
      });
  });
});

describe("[CATEGORY_2]: 전체 카테고리의 상세 정보", () => {
  const url = "/adm/category";
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

describe("[CATEGORY_3]: 수정된 카테고리 반영", () => {
  const url = "/adm/category";
  const body = {
    categories: [{ id: 1, name: "React2", priority: 1 }],
  };
  it("Correct token", (done) => {
    request(app)
      .post(url)
      .set("Cookie", `token=${token}`)
      .send(body)
      .end((err, res) => {
        expect(res.body.code).to.be.equal(0);

        request(app)
          .get(url)
          .set("Cookie", `token=${token}`)
          .end((err, res) => {
            const arrResult = res.body.categories;
            for (let i in body.categories) {
              const input = body.categories[i];
              const output = arrResult[i];
              expect(input.id).to.be.equal(output.id);
              expect(input.name).to.be.equal(output.name);
              expect(input.priority).to.be.equal(output.priority);
            }

            done();
          });
      });
  });
});

describe("[CATEGORY_4]: 카테고리 추가", () => {
  const url = "/adm/add-category";
  const body = {
    category: "Network",
  };
  it("Correct token / Correct category name", (done) => {
    request(app)
      .post(url)
      .set("Cookie", `token=${token}`)
      .send(body)
      .expect(200)
      .end((err, res) => {
        expect(res.body.code).to.be.equal(0);
        done();
      });
  });

  it("Correct token / Duplicated category name", (done) => {
    request(app)
      .post(url)
      .set("Cookie", `token=${token}`)
      .send(body)
      .expect(200)
      .end((err, res) => {
        expect(res.body.code).to.be.equal(1);
        expect(res.body.msg).to.be.equal("Duplicated name");

        done();
      });
  });
});
