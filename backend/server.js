import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import passport from "passport";
import session from "express-session";
import { setupGoogleAuth } from "./config/passport.js";

dotenv.config();
const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Session setup for passport
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "Lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Register Google OAuth strategies before using routes
setupGoogleAuth("student");
setupGoogleAuth("teacher");

// ✅ Now, define routes
app.use("/api/auth", authRoutes);
// app.use("/api/auth", googleAuthRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
      app.listen(PORT, () => {
          console.log(`Server running on PORT: ${PORT}`);
      });
      await connectDb();
  } catch (error) {
      console.error("Database connection failed", error);
  }
})();