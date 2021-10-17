import { create } from "domain";
import { NextFunction, Request, Response } from "express";
import {
  TCategoryDetail,
  TCntContents,
  TCntLike,
  TVisitor,
} from "../lib/types";
import createToken from "../middlewares/createToken";
import verifyToken from "../middlewares/verifyToken";
import { Op } from "sequelize";
const fs = require("fs");
const path = require("path");

const {
  Visit,
  Content,
  Visitor,
  Category,
  Like,
  Img,
  sequelize: seq,
} = require("../../models");

const router = require("express").Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

router.post("/auth", (req: Request, res: Response) => {
  const { k } = req.body;
  const created = createToken(k);

  res.cookie("token", created, {
    // sameSite: "none", secure: true
    domain: "https://nullsafety-be.herokuapp.com/",
    path: "/",
  });
  res.json({ token: created, code: created ? 0 : 1 });
});

router.get("/category", verifyToken, async (req: Request, res: Response) => {
  // ## todo
  // (1) db에서 order by priority, (2) find이후 Array.sort
  // 둘 중 어느 것이 성능 면에서 유리한지 생각하기
  Category.findAll()
    .then((c: any) => {
      res.json({
        categories: c
          .map((item: any) => item.dataValues)
          .sort(
            (a: TCategoryDetail, b: TCategoryDetail) => a.priority - b.priority
          ),
      });
    })
    .catch((e: any) => {
      console.warn("Error in adm/category::: ", e);
      res.status(500).json({ categories: [] });
    });
});

router.post(
  "/category",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // #todo: Delete

      let prev: TCategoryDetail[] = (await Category.findAll())
        .map((item: any) => item.dataValues)
        .sort((a: TCategoryDetail, b: TCategoryDetail) => a.id - b.id);
      const input: TCategoryDetail[] = req.body.categories.sort(
        (a: TCategoryDetail, b: TCategoryDetail) => a.id - b.id
      );

      let modified: { name?: string; priority?: number } = {};
      for (let curInput of input) {
        if (!prev[0]) break;

        // 중간에 삭제된 카테고리가 있을 경우
        if (curInput.id > prev[0].id) {
          while (curInput.id !== prev[0].id) {
            await Category.destroy({ where: { id: prev[0].id } });
            prev.shift();
          }
        }
        // 기존 카테고리 수정
        if (curInput.id === prev[0].id) {
          modified = {};
          if (curInput.name !== prev[0].name) modified.name = curInput.name;
          if (curInput.priority !== prev[0].priority)
            modified.priority = curInput.priority;

          if (modified)
            Category.update(modified, { where: { id: prev[0].id } });

          prev.shift();
        }
      }
      // 끝에 삭제된 항목이 있는 경우
      if (prev.length) {
        prev.map((p) => {
          Category.destroy({ where: { id: p.id } });
        });
      }

      res.json({ code: 0, msg: "" });
    } catch (e) {
      console.warn("Error in adm/category (post) ::: ", e);
      next(new Error());
    }
  }
);

router.post(
  "/add-category",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.category) {
      next(new Error());
      return;
    }

    let lastPriority = 0;
    const categories = await Category.findAll({
      attribute: ["priority", "name"],
      order: [["priority", "desc"]],
    });

    if (categories && categories.length) lastPriority = categories[0].priority;

    if (categories.some((c: TCategoryDetail) => c.name === req.body.category)) {
      res.status(400).json({ code: 1, msg: "Duplicated name" });
      return;
    }

    Category.create({
      name: req.body.category,
      priority: lastPriority + 1,
    }).then(() => {
      res.json({ code: 0, msg: "success" });
    });
  }
);

router.post(
  "/content",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, content, title, cid } = req.body;
    const categoryId = (await Category.findOne({ where: { name: category } }))
      .id;

    if (!cid) {
      const now = new Date();
      const today =
        now.getFullYear() +
        "-" +
        (now.getMonth() + 1).toString().padStart(2, "0") +
        "-" +
        now.getDate().toString().padStart(2, "0");

      Content.create({ content, cid: categoryId, title, createdAt: today })
        .then(async (r: any) => {
          await Img.update({ cid: r.id }, { where: { cid: -1 } });
          const thumbnail = await Img.findOne({ where: { cid: r.id } });
          if (!thumbnail) return;
          await Content.update(
            { thumbnail: thumbnail.path },
            { where: { id: r.id } }
          );
        })
        .then(() => {
          res.json({ code: 0, msg: "Created" });
        })
        .catch((e: any) => {
          console.warn("Error in create content ::: ", e);
          res.json({ code: -1, msg: "Internal server error" });
        });

      return;
    }

    Content.update({ content, cid: categoryId, title }, { where: { id: cid } })
      .then((r: any) => {
        res.json({ code: 1, msg: "Modified" });
      })
      .catch((e: any) => {
        console.warn("Error in modify content ::: ", e);
        res.json({ code: -1, msg: "Internal server error" });
      });

    let imgs = content.match(/!\[\]\(\S+(\.(jpg|png|gif))/g);
    if (imgs) {
      await Img.destroy({ where: { id: cid } });
      imgs = imgs.map((i: string) => {
        const path = i.substring(4);
        Img.create({ path, cid });
      });
    }
  }
);

router.post("/remove", (req: Request, res: Response, next: NextFunction) => {
  const { cid } = req.body;
  if (!cid) {
    res.json({ code: 2, msg: "Missing content id" });
    return;
  }

  try {
    Content.destroy({ where: { id: cid } }).then((r: any) => {
      if (!r) res.json({ code: 1, msg: "Invalid content id" });
      else res.json({ code: 0, msg: "Deleted" });
    });
  } catch (e) {
    console.warn("Error in remove content ::: ", e);
    res.json({ code: -1, msg: "Internal server error" });
  }
});

router.get("/dash", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // cntVisitor.total, cntVisitor.months
    const visits = await Visit.findAll({
      group: ["ym"],
      attributes: ["ym", [seq.fn("sum", seq.col("visited")), "v"]],
    });
    let cntVisitor = visits.reduce(
      (acc: TVisitor, cur: any) => {
        const curV = Number(cur.dataValues.v);
        acc.total += curV;
        acc.months.push([cur.ym, curV]);
        return acc;
      },
      { total: 0, today: 0, months: [] }
    );

    let dictCategory: any = {};

    (await Category.findAll({ attributes: ["id", "name"] })).map((c: any) => {
      dictCategory[c.id] = c.name;
    });

    // cntVisitor.today
    const now = new Date();
    const todayYM =
      now.getFullYear() +
      "." +
      (now.getMonth() + 1).toString().padStart(2, "0");
    const todayD = now.getDate().toString().padStart(2, "0");
    const today = await Visit.findOne({
      where: { ym: todayYM, d: todayD },
    });
    cntVisitor.today = Number(today?.visited || 0);

    // cntContent
    const contents = await Content.findAll({
      where: { cid: { [Op.ne]: null } },
      group: ["cid"],
      attributes: [
        "cid",
        [seq.fn("count", seq.col("id")), "cnt"],
        [seq.fn("sum", seq.col("liked")), "liked"],
      ],
    });
    let cntContents: TCntContents = { total: 0, perCategory: [] };
    let cntLike: TCntLike = { total: 0, perCategory: [] };

    for (let { dataValues: cur } of contents) {
      const curCategory = dictCategory[cur.cid];
      const liked = Number(cur.liked);

      cntContents.total += cur.cnt;
      cntContents.perCategory.push([curCategory, cur.cnt]);

      cntLike.total += liked;
      cntLike.perCategory.push([curCategory, liked]);
    }

    res.json({ cntVisitor, cntContents, cntLike });
  } catch (e) {
    console.warn("Error in dash ::: ", e);
    res.json({
      cntVisitor: { total: 0, today: 0, months: [] },
      cntContents: { total: 0, perCategory: [] },
      cntLike: { total: 0, perCategory: [] },
    });
  }
});

router.post("/pic", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pic } = req.body;
    if (pic === undefined) {
      res.json({ code: 2, msg: "Missing image", path: "" });
      return;
    } else if (typeof pic !== "string" || pic.length < 100) {
      res.json({ code: 1, msg: "Invalid base64 string", path: "" });
      return;
    }

    const picName = `${new Date().getTime()}.jpg`;
    const picPath = `/imgs/${picName}`;
    const picPathAbs = `${__dirname}/../../imgs/${picName}`;
    Img.create({ path: picPath }).catch((e: any) => {
      console.warn("Error in create picture::: ", e);
    });
    fs.writeFile(picPathAbs, Buffer.from(pic, "base64"), (err: any) => {
      console.warn("#1", err);
    });

    // db.create
    // response
    res.json({ code: 0, msg: "Success", path: "/imgs/" + picName });
  } catch (e) {
    console.warn("#2", e);

    next(new Error());
  }
});
module.exports = router;
