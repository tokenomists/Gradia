import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import jwt from "jsonwebtoken";

dotenv.config();

const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const setupGoogleAuth = (userType) => {
  passport.use(
    `${userType}-google`, // ✅ Correct strategy name
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
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
            });
            
            await user.save();
          }

          const token = generateToken(user._id, userType);
          
          return done(null, { user, token }); // Send JWT token with respons
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

// ✅ Ensure passport.serialize/deserialize are defined
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export { setupGoogleAuth };
