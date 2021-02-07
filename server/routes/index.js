import { Router } from "express";

const userRouter = require("./users");
const twitterRouter = require("./twitter");
const tokenVerifier = require("../middleware/token-verfication");

const router = Router();

router.use("/users", tokenVerifier, userRouter);

router.use("/auth/twitter", tokenVerifier, twitterRouter);

module.exports = router;
