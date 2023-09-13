const express = require("express"),
  path = require("node:path"),
  cors = require("cors"),
  envPath = path.resolve(__dirname, "..", ".env"),
  dotenv = require("dotenv").config({ path: envPath }),
  cookieParser = require("cookie-parser"),
  fs = require("fs"),
  http = require("http"),
  https = require("https"),
  app = express(),
  authRouter = require("./routes/auth-router"),
  mapRouter = require("./routes/map-router");

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    //origin: ["https://maps-united.vercel.app/", "http://75.197.143.18/5173"],
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json({ limit: "100MB" }));
app.use(cookieParser());
app.use("/auth", authRouter);
app.use("/api", mapRouter);

module.exports = app;
