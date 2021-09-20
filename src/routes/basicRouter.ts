import { Request, Response } from "express";
import { Op } from "sequelize";

const { Visit, Content, sequelize: seq } = require("../../models");

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
  const cntToday =
    (await seq.query(
      `select visited from visits where ym=${y}.${m} and d=${d}`
    )[0]?.visited) || 0;
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

  res.json({ cntToday, cntTotal, contentPreviewsByHit, contentPreviewsByLike });
});

module.exports = router;
