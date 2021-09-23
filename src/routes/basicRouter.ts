import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { TContentPreview } from "../lib/types";

const {
  Visit,
  Content,
  Visitor,
  Category,
  Like,
  sequelize: seq,
} = require("../../models");

const router = require("express").Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

// [MAIN_1] 메인 화면에 출력할 데이터들
router.get("/main", async (req: Request, res: Response) => {
  // cntTotal
  // cntToday
  // contentPreviewsByLike
  // contentPreviewsByHit
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const visitToday = await Visit.findOne({
    where: { ym: { [Op.eq]: y + "." + m }, d: { [Op.eq]: d } },
  });

  const visitTotal = (
    await seq.query(`
  select sum(visited) as total from visits
  `)
  )[0];

  const contentPreviewsByHit = await Content.findAll({
    orders: [["hit", "asc"]],
    limit: 5,
  });
  const contentPreviewsByLike = await Content.findAll({
    orders: [["liked", "asc"]],
    limit: 5,
  });

  res.json({
    cntToday: visitToday?.visited || 0,
    cntTotal: visitTotal[0]?.total || 0,
    contentPreviewsByHit,
    contentPreviewsByLike,
  });
});

router.post("/visit", async (req: Request, res: Response) => {
  // #1. Visitor에서 host 확인
  // #2. 있으면 응답
  // #3. 없으면 Visitor에 host 등록, Visit에 count
  // #4. Visit에 오늘 날짜 있는지 검색
  // #5. 있으면 오늘 날짜의 visited 업데이트
  // #6. 없으면 추가

  const { host } = req.headers;
  // #1
  const exist = !!(await Visitor.findOne({
    where: {
      host: { [Op.eq]: host },
    },
  }));
  // #2
  if (exist)
    return res.status(200).json({ code: 1, msg: "Already visited today" });
  // #3
  Visitor.create({ host }).catch((e: any) => {
    console.log("Fail::: ", e);
  });

  const now = new Date();
  const ym =
    now.getFullYear() + "." + (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate();
  const whereForVisit = {
    ym: { [Op.eq]: ym },
    d: { [Op.eq]: d },
  };

  // #4
  const existedVisit = await Visit.findOne({
    where: whereForVisit,
  });
  // #5
  if (existedVisit)
    Visit.update(
      { visited: existedVisit.visited + 1 },
      { where: whereForVisit }
    ).catch((e: any) => {
      console.warn("Fail to update visit::::::", e);
    });
  // #6
  else
    Visit.create({ ym, d, visited: 1 }).catch((e: any) => {
      console.warn("Fail to create visit::::::", e);
    });

  res.status(200).json({ code: 0, msg: "success" });
});

// [CATEGORY_1] 카테고리 이름 목록
router.get("/categories", async (req: Request, res: Response) => {
  Category.findAll({ attribute: ["name"] })
    .then((r: any) => {
      res.json({ categories: r });
    })
    .catch((e: any) => {
      console.warn("Error in find categories::::: ", e);
      res.json({ categories: [] });
    });
});

// [CONTENT_1] 특정 카테고리의 컨텐츠 목록 (요약 정보)
router.get(
  "/contents",
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, offset, limit } = req.query;

    const targetCategory = await Category.findOne({
      where: { name: category },
    });
    if (!targetCategory) return next(new Error("Incorrect category name"));

    const categoryId = targetCategory.id;

    Content.findAll({
      where: { cid: categoryId },
      attributes: ["id", "title", "thumbnail", "createdAt"],
      offset: offset || 0,
      limit: limit || 20,
    })
      .then((r: any) => {
        const contentPreviews: TContentPreview = r.map((content: any) => {
          content.dataValues.category = category;
          return content.dataValues;
        });

        res.json({ contentPreviews });
      })
      .catch((e: any) => {
        console.warn("Error in contents::::", e);
        res.json({ contentPreviews: [] });
      });
  }
);

router.get(
  "/content",
  async (req: Request, res: Response, next: NextFunction) => {
    const { cid } = req.query;
    let categoryName = "";
    try {
      const dbResult = await seq.query(
        `select*, lag(id) over() as prev, lead(id) over() as next from contents`
      );
      if (!dbResult) next(new Error("Invalid content id"));
      let content = dbResult[0][0];

      const category = await Category.findOne({ where: { id: content.cid } });
      categoryName = category.name;

      content.createdAt = "2021-09-23";
      content.category = categoryName;

      let prevContentPreview;
      let nextContentPreview;
      if (content.prev) {
        prevContentPreview = await Content.findOne({
          where: { id: content.prev },
        });
        prevContentPreview.category = categoryName;
        delete prevContentPreview.cid;
      }
      if (content.next) {
        nextContentPreview = await Content.findOne({
          where: { id: content.next },
        });
        nextContentPreview.category = categoryName;
        delete nextContentPreview.cid;
      }

      delete content.prev;
      delete content.next;
      delete content.cid;

      const responseData = {
        contentData: content,
        prevContentPreview,
        nextContentPreview,
      };

      res.json(responseData);
    } catch (e) {
      console.warn("DB ERROR::: ", e);
      res.json({});
    }
  }
);

router.post(
  "/like",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { host } = req.headers;
      const { cid } = req.body;

      if (!cid || typeof cid !== "number") {
        res.json({ code: 2, msg: "Invalid content id" });
        return;
      }

      const existedContent = await Content.findOne({ where: { id: cid } });
      if (!existedContent) {
        res.json({ code: 3, msg: "Unknown content" });
        return;
      }

      const alreadyLiked = await Like.findOne({
        where: {
          host,
          cid,
        },
      });

      if (alreadyLiked) {
        res.json({ code: 1, msg: "Already liked" });
        return;
      }

      Content.update(
        { liked: existedContent.liked + 1 },
        { where: { id: cid } }
      );
      Like.create({ host, cid });

      res.json({ code: 0, msg: "Success" });
    } catch (e) {
      console.warn("::::::", e);
      res.status(500).json({ code: -1, msg: "Internal server error" });
    }
  }
);

module.exports = router;
