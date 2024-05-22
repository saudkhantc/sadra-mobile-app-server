import express from "express";
import User from "../../schema/user-schema.js";
import bcryptjs from "bcryptjs";
import jsonWebToken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(username && email && password)) {
      return res.status(400).send("All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email address");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashPassword,
    });

    await user.save();

    res.status(200).send("User created successfully");
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send("All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email address");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }
    const matchPassword = await bcryptjs.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).send("Invalid credentials");
    }

    const token = await jsonWebToken.sign(
      { userId: user._id },
      process.env.SECRET_AUTH,
      {
        expiresIn: "1h",
      }
    );
    user.token = token;
    user.password = undefined;

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

export default router;
