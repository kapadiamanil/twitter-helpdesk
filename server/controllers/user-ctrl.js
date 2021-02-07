import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import validateRegisterInput from "../validation/register";
import validateLoginInput from "../validation/login";

import User from "../models/User";
import { createEntity, findOneEntityCustom } from "../service/service";

const secretOrKey = process.env.JWT_KEY;

const saltRounds = 10;

export const registerUser = async (res, req, next) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
      throw new ErrorHandler(404, errors);
    }

    const userNameAlreadyExist = await findOneEntityCustom(
      { username: req.body.username },
      User
    );

    if (userNameAlreadyExist) {
      throw new ErrorHandler(400, "Email already exists");
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      // Hash password before saving in database
      const hash = await bcrypt.hash(newUser.password, saltRounds);

      newUser.password = hash;

      const user = await createEntity(newUser);

      return res.status(200).json({
        success: true,
        id: user,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (res, req, next) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
      throw new ErrorHandler(404, errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    const searchedUser = await findOneEntityCustom({ email }, User);

    // Check if user exists
    if (!searchedUser) {
      throw new ErrorHandler(400, "Email not found");
    }
    // Check password
    const isMatch = await bcrypt.compare(password, searchedUser.password);

    if (isMatch) {
      // User matched
      // Create JWT Payload
      const payload = {
        id: user.id,
        name: user.name,
      };
      // Sign token
      jwt.sign(
        payload,
        secretOrKey,
        {
          expiresIn: 31556926, // 1 year in seconds
        },
        (err, token) => {
          res.status(200).json({
            success: true,
            token: "Bearer " + token,
          });
        }
      );
    } else {
      throw new ErrorHandler(400, "Password incorrect");
    }
  } catch (error) {
    next(error);
  }
};
