import jsonwebtoken from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const tokenBearer = req.headers.authorization;
  if (!tokenBearer) {
    return res.status(401).send("Access denied");
  }
  const token = tokenBearer.split(" ")[1];

  if (!token) {
    return res.status(401).send("Access denied");
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.SECRET_AUTH);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Login session expires Login again!" });
  }
};

export default authMiddleware;
