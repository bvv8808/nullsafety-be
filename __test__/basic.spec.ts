import { expect, should } from "chai";
import { describe, it } from "mocha";
import request from "supertest";
import { IResMain1 } from "../src/lib/interfaces";
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
});
