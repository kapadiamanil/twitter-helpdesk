import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user-ctrl";

const router = Router();

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", registerUser);

router.post("/login", loginUser);

module.exports = router;
