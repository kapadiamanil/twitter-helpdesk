import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import SocketIO from "socket.io";
import { handleError } from "./middleware/error";

(async () => {
  const env = `${process.env.NODE_ENV || "development"}`;
  const secondaryEnv = `${process.env.SEC_ENV || env}`;
  require("dotenv").config({
    path: path.resolve(__dirname, `./config/${secondaryEnv}.env`),
  });

  const db = require("./db");

  global.schema = await getSchema();

  const router = require("./routes");

  const app = express();
  const apiPort = process.env.PORT || 3000;

  // to prevent clickjacking
  app.use(function (req, res, next) {
    res.set("X-Frame-Options", "DENY");
    next();
  });

  // to prevent Browser content sniffing
  app.use(function (req, res, next) {
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });

  // for HSTS
  app.use(function (req, res, next) {
    res.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubdomains; preload"
    );
    next();
  });

  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(cors());
  app.use(bodyParser.json());

  // Passport middleware
  app.use(passport.initialize());

  const customPassport = require("./passport");

  // Passport config
  customPassport(passport);

  //Socket io setup
  const server = require("http").Server(app);
  const io = require("socket.io")(server);
  io.on("connection", (socket) => {
    const screenName = socket.handshake.query.screenName;
    socket.join(screenName);
    console.log(" %s sockets connected", io.engine.clientsCount);
    socket.on("disconnect", function () {
      console.log("[NodeApp] (socket.io) A client has disconnected");
      socket.disconnect();
    });
  });
  app.use((req, res, next) => {
    res.io = io;
    next();
  });

  // Routes

  app.use("/", router);

  app.use(express.static(path.join(__dirname, "..", "build")));

  app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
  });

  // Error Handling Middleware
  app.use(handleError);

  app.listen(apiPort, () =>
    console.log(`Server running on port ${apiPort} in ${env} environment`)
  );
})();
