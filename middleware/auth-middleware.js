import jsonwebtoken from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const tokenBearer = req.headers.authorization;
  if (!tokenBearer) {
    return res.status(401).send("Access denied. No token provided.");
  }
  const token = tokenBearer.split(" ")[1];

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.SECRET_AUTH);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).send("Invalid token.");
  }
};

export default authMiddleware;
