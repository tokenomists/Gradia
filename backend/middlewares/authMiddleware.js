import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded; // `{ id, role }`
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default protect;