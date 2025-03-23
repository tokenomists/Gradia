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
          const { given_name, family_name, email, picture } = profile._json;
          console.log("Profile:", profile);

          const Model = userType === "student" ? Student : Teacher;
          let user = await Model.findOne({ googleId: profile.id });

          if (!user) {
            user = await Model.create({
              fname: given_name,
              lname: family_name,
              email: email,
              googleId: profile.id,
              profilePicture: picture,
            });
            
            await user.save();
          }

          const token = generateToken(user._id, userType);
          
          return done(null, { user, token, email }); // Send JWT token with respons
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, { id: user._id, email: user.email, fname: user.fname, lname: user.lname, token: user.token });
});

passport.deserializeUser((obj, done) => {
  console.log("Deserializing user:", obj);
  done(null, obj);
});


export { setupGoogleAuth };