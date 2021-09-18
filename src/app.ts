import { NextFunction, Request, Response } from "express";
import "reflect-metadata";

const express = require("express");

const app = express();

app.set("port", process.env.PORT || 5000);
// ?????
app.use("/", require("./routes/rootRouter"));

app.use((req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  if (err.message === "Not Found") res.send("404 Not Found");
  else res.send("Internal server error");
});

app.listen(app.get("port"), () => {
  console.log(`Listen at `, app.get("port"));
});

module.exports = app;
