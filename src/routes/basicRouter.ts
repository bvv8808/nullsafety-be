import { Request, Response } from "express";
import { Op } from "sequelize";

const { Visit, Content, Visitor, sequelize: seq } = require("../../models");

const router = require("express").Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

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

  const cntTotal =
    (await seq.query(`
  select sum(visited) as total from visits
  `)[0]?.total) || 0;

  const contentPreviewsByHit = await Content.findAll({
    orders: [["hit", "asc"]],
    limit: 5,
  });
  const contentPreviewsByLike = await Content.findAll({
    orders: [["like", "asc"]],
    limit: 5,
  });

  res.json({
    cntToday: visitToday?.visited || 0,
    cntTotal,
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

module.exports = router;
