import { expect, should } from "chai";
import { describe, it } from "mocha";
import request from "supertest";
import { IResCode, IResContent2, IResMain1 } from "../src/lib/interfaces";
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

describe("[CONTENT_2]: 특정 컨텐츠 상세 정보와 이전/다음 컨텐츠 링크", () => {
  it("Correct content id", (done) => {
    const url = "/content?cid=1";
    request(app)
      .get(url)
      .expect(200)
      .end((err, res) => {
        const response: IResContent2 = res.body;
        const { contentData, prevContentPreview, nextContentPreview } =
          response;

        expect(contentData).to.be.exist;
        expect(contentData.id).to.be.exist;
        expect(contentData.category).to.be.exist;
        expect(contentData.content).to.be.exist;
        expect(contentData.createdAt).to.be.exist;
        expect(contentData.title).to.be.exist;

        if (prevContentPreview) {
          expect(prevContentPreview.title).to.be.exist;
          expect(prevContentPreview.category).to.be.exist;
          expect(prevContentPreview.createdAt).to.be.exist;
          expect(prevContentPreview.thumbnail).to.be.exist;
          expect(prevContentPreview.id).to.be.exist;
        }
        if (nextContentPreview) {
          expect(nextContentPreview.title).to.be.exist;
          expect(nextContentPreview.category).to.be.exist;
          expect(nextContentPreview.createdAt).to.be.exist;
          expect(nextContentPreview.thumbnail).to.be.exist;
          expect(nextContentPreview.id).to.be.exist;
        }
        done();
      });
  });
});

describe("[CONTENT_3]: 특정 게시물에 따봉", () => {
  const url = "/like";
  it("Correct content id", (done) => {
    request(app)
      .post(url)
      .send({ cid: 1 })
      .expect(200)
      .end((err, res) => {
        const response: IResCode = res.body;
        expect(response.code).to.be.equal(0);
        done();
      });
  });

  it("Invalid content id (miss cid)", (done) => {
    request(app)
      .post(url)
      .expect(200)
      .end((err, res) => {
        const response: IResCode = res.body;
        expect(response.msg).to.be.equal("Invalid content id");
        done();
      });
  });

  it("Invalid content id (not number)", (done) => {
    request(app)
      .post(url)
      .send({ cid: "React" })
      .expect(200)
      .end((err, res) => {
        const response: IResCode = res.body;
        expect(response.msg).to.be.equal("Invalid content id");
        done();
      });
  });

  it("Invalid content id (wrong number)", (done) => {
    const url = "/like";
    request(app)
      .post(url)
      .send({ cid: -1 })
      .expect(200)
      .end((err, res) => {
        const response: IResCode = res.body;
        expect(response.msg).to.be.equal("Unknown content");
        done();
      });
  });
});
