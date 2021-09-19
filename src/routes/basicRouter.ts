import { Request, Response } from "express";

const router = require("express").Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

router.get("/main", (req: Request, res: Response) => {
  res.json({});
});

module.exports = router;
