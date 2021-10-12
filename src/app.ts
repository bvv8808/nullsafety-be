import { NextFunction, Request, Response } from "express";

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();

const { sequelize } = require("../models/");
sequelize.sync();

app.set("port", process.env.PORT || 5000);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.json({ limit: "20mb" }));
app.use(require("cookie-parser")());

app.use("/imgs", express.static("imgs"));
app.use("/", require("./routes/basicRouter"));
app.use("/adm", require("./routes/admRouter"));

app.use((req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  console.error("#Error:::: ", err);

  if (err.message === "Not Found") res.send("404 Not Found");
  else res.send("Internal server error");
});

app.listen(app.get("port"), () => {
  console.log(`Listen at `, app.get("port"));
});

module.exports = app;
