import { Router } from "express";
import {
  requestAuthToken,
  tokenVerifier,
  replyTweet,
  getRecentMentions,
} from "../controllers/twitter-ctrl";

const router = Router();

router.post("/reverse", requestAuthToken);

router.post("/", tokenVerifier);

router.post("/reply", replyTweet);

router.post("/getRecentMentions", getRecentMentions);

module.exports = router;
