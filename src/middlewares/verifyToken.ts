import { NextFunction, Request, Response } from "express";
const jwt = require("jsonwebtoken");

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const t = req.cookies.token;
    const decoded = jwt.verify(t, process.env.SECRET);

    res.locals.auth = decoded.key === process.env.ADMIN;
    next();
  } catch (e) {
    // console.warn(e);
    next();
  }
};
