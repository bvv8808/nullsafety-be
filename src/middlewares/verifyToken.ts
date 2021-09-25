import { NextFunction, Request, Response } from "express";
const jwt = require("jsonwebtoken");

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const t = req.cookies.token;
    if (!t) {
      res.status(400).json({ categories: [] });
      return;
    }
    const decoded = jwt.verify(t, process.env.SECRET);

    if (decoded.key !== process.env.ADMIN) {
      res.status(400).json({ categories: [] });
      return;
    }
    res.locals.auth = true;
    next();
  } catch (e) {
    console.warn(e);
    next(new Error("Internal server error"));
  }
};
