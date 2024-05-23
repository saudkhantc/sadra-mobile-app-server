import express from "express";
import User from "../../schema/user-schema.js";
import bcryptjs from "bcryptjs";
import jsonWebToken from "jsonwebtoken";
import dotenv from "dotenv";
import authMiddleware from "../../middleware/auth-middleware.js";

dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(username && email && password)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashPassword,
    });

    await user.save();

    res.status(200).json({ success: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const matchPassword = await bcryptjs.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
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
    user.email = undefined;

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid request.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.patch("/me/update", authMiddleware, async (req, res) => {
  const userId = req.userId;
  // TODO: Add fields that you want to update
  const { username, bio } = req.body;
  const user = await User.findById(userId);
  try {

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid request.",
      });
    }

    user.username = username;
    user.bio = bio;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Username updated successfully.",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default router;
