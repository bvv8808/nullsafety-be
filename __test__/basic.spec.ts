import { expect, should } from "chai";
import { describe, it } from "mocha";
import request from "supertest";
import { IResMain1 } from "../src/lib/interfaces";
import { TContentPreview } from "../src/lib/types";
const app = require("../src/app");

describe("[MAIN_1]: 방문자 수와 HOT 컨텐츠", () => {
  const url = "/main";
  it("GET: Success", (done) => {
    request(app)
      .get(url)
      .expect(200)
      .end((err, res) => {
        const result: IResMain1 = res.body;
        try {
          expect(result.cntToday).to.be.exist;
          expect(result.cntTotal).to.be.exist;
          expect(result.contentPreviewsByHit).instanceOf(Array);
          expect(result.contentPreviewsByLike).instanceOf(Array);
          done();
        } catch (e) {}
        // expect(res.text).to.equal("Hello");
      });
  });

  it("Visit: Correct Path", (done) => {
    const urlVisit = "/visit";
    const urlMain = "/main";
    let todayVisit: number;
    request(app)
      .get(urlMain)
      .end((err, res) => {
        todayVisit = res.body.cntToday;

        request(app)
          .post(urlVisit)
          .expect(200)
          .end((err, res) => {
            request(app)
              .get(urlMain)
              .end((err, res) => {
                expect(res.body.cntToday).to.be.equal(todayVisit + 1);
                done();
              });
          });
      });
  });
});

describe("[CATEGORY_1]: 카테고리 리스트", () => {
  it("Category List", (done) => {
    const url = "/categories";
    request(app)
      .get(url)
      .expect(200)
      .end((err, res) => {
        const { categories } = res.body;

        expect(categories).to.be.instanceOf(Array);
        done();
      });
  });
});

describe("[CONTENT_1]: 특정 카테고리의 컨텐츠 목록 (요약 정보)", () => {
  it("Correct Category", (done) => {
    const url = "/contents?category=React";
    request(app)
      .get(url)
      .expect(200)
      .end((err, res) => {
        const contentPreviews: TContentPreview[] = res.body.contentPreviews;

        expect(contentPreviews).to.be.instanceOf(Array);
        done();
      });
  });
  it("Incorrect Category", (done) => {
    const url = "/contents?category=Incorrect";
    request(app)
      .get(url)
      .expect(500)
      .end((err, res) => {
        expect(res.text).to.be.equal("Internal server error");
        done();
      });
  });
});
