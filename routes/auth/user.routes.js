import express, { text } from "express";
import User from "../../schema/user-schema.js";
import bcryptjs from "bcryptjs";
import jsonWebToken from "jsonwebtoken";
import dotenv from "dotenv";
import authMiddleware from "../../middleware/auth-middleware.js";
import { SendEmail } from "../../send-email.js";
import crypto from "crypto";
import PasswordReset from "../../schema/reset-password-schema.js";

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
        expiresIn: "5m",
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
      message: "User information updated successfully.",
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

router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expiresAt = Date.now() + 1800000;

    const link = `http://localhost:3000/auth/reset-password/${token}`;

    await PasswordReset.create({ userId: user._id, token, expiresAt });
    const htmlContent = `
    <div style="padding: 20px; text-align: center;">
        <p style="font-size: 16px; line-height: 24px; color: #4b5563;">We received a request to reset your password. Click the button below to reset your password.</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #34d399; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 700;">Reset Password</a>
    </div>
  `;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: htmlContent,
    };

    await SendEmail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    const passwordReset = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: Date.now() },
    });

    if (!passwordReset) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Request." });
    }

    const user = await User.findById(passwordReset.userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Request." });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    user.password = hashPassword;

    await user.save();

    await PasswordReset.deleteOne({ _id: passwordReset._id });

    res
      .status(200)
      .json({ success: true, message: "Password has been reset." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
