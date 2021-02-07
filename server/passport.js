import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import { model } from "mongoose";
import { findOneEntityCustom } from "./service/service";

const User = model("users");

let secretOrKey = process.env.PASSPORT_KEY;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretOrKey;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await findOneEntityCustom(
                    { _id: jwt_payload.id },
                    User
                );
                if (user) return done(null, user);
                return done(null, false);
            } catch (error) {
                throw error;
            }
        })
    );
};
