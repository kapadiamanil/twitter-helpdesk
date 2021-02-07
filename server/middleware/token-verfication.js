import { ERROR_MESSAGE } from "../ErrorMessages";
import { ErrorHandler } from "../middleware/error";

import jwt_decode from "jwt-decode";

const tokenVerifier = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (req.originalUrl === "/api/user/login") {
      res.locals.authenticating = true;
      next();
      return;
    } else if (token && token !== "undefined") {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000; // to get in milliseconds
      if (decoded.exp < currentTime) {
        throw new ErrorHandler(401, ERROR_MESSAGE.UNAUTHORIZED);
      }
      res.locals.currentUser = decoded;
      next();
      return;
    } else throw new ErrorHandler(401, ERROR_MESSAGE.UNAUTHORIZED);
  } catch (error) {
    next(error);
  }
};

module.exports = tokenVerifier;
