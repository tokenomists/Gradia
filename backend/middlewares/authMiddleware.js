import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const role = req.cookies.role;
        const email = req.cookies.email;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        // Fetch user from DB
        const Model = role === "student" ? Student : Teacher;
        const user = await Model.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        // Attach user details to request
        req.user = {
            id: user._id,
            email: user.email,
            role,
            name: user.lname ? `${user.fname} ${user.lname}` : user.fname,
            profilePic: user.profilePicture,
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ message: "Unauthorized: Token verification failed" });
    }
};

export default authMiddleware;
