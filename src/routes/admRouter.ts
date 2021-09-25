import { NextFunction, Request, Response } from "express";
import { TCategoryDetail } from "../lib/types";
import createToken from "../middlewares/createToken";
import verifyToken from "../middlewares/verifyToken";

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

router.post("/auth", (req: Request, res: Response) => {
  const { k } = req.body;
  const created = createToken(k);
  res.json({ token: created, code: created ? 0 : 1 });
});

router.get("/category", verifyToken, async (req: Request, res: Response) => {
  Category.findAll()
    .then((c: any) => {
      res.json({ categories: c.map((item: any) => item.dataValues) });
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
      const prev: TCategoryDetail[] = (await Category.findAll())
        .map((item: any) => item.dataValues)
        .sort((a: TCategoryDetail, b: TCategoryDetail) => a.id - b.id);
      const input: TCategoryDetail[] = req.body.categories.sort(
        (a: TCategoryDetail, b: TCategoryDetail) => a.id - b.id
      );

      let modified: { name?: string; priority?: number } = {};
      for (let i in prev) {
        // name, priority
        modified = {};
        if (prev[i].name !== input[i].name) modified.name = input[i].name;
        if (prev[i].priority !== input[i].priority)
          modified.priority = input[i].priority;

        if (modified) Category.update(modified, { where: { id: prev[i].id } });
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
    if (categories) lastPriority = categories[0].priority;

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

module.exports = router;
