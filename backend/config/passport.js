import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const setupGoogleAuth = (userType) => {
  passport.use(
    `${userType}-google`, // Strategy name
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `/api/auth/${userType}/google/callback`,
        passReqToCallback: true,
        scope: ["profile", "email"],
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const Model = userType === "student" ? Student : Teacher;
          let user = await Model.findOne({ googleId: profile.id });

          if (!user) {
            user = await Model.create({
              fname: profile.name.givenName,
              lname: profile.name.familyName,
              email: profile.emails[0].value,
              googleId: profile.id,
            });
            
            await user.save();
          }

          const token = generateToken(user._id, userType);

          // res.cookie("token", token, {
          //   httpOnly: true,
          //   sameSite: true,
          //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          // });
          
          return done(null, { user, token }); // Send JWT token with respons
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export { setupGoogleAuth };
