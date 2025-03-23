import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const TeacherSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Only required for email/password auth
  googleId: { type: String }, // Used for Google OAuth authentication
  profilePicture: { type: String }, // URL to profile picture
  // classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }], // List of created classes
}, {
    timestamps: true,
    collection: "teachers"
});

// Hash password before saving
TeacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Teacher = mongoose.model("Teacher", TeacherSchema);
export default Teacher;