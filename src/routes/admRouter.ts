import { Request, Response } from "express";
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
  if (!res.locals.auth) {
    res.status(400).json({ categories: [] });
    return;
  }

  Category.findAll()
    .then((c: any) => {
      res.json({ categories: c });
    })
    .catch((e: any) => {
      console.warn("Error in adm/category::: ", e);
      res.status(500).json({ categories: [] });
    });
});

module.exports = router;
