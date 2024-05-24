import express from "express";
import upload from "../../middleware/multer.js";
import cloudinary from "../../cloudinary.config.js";
import authMiddleware from "../../middleware/auth-middleware.js";
import User from "../../schema/user-schema.js";
const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    cloudinary.uploader.upload(req.file.path, async function (err, result) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          success: false,
          message: "Profile image can't be uploaded try again",
        });
      }

      const userId = req.userId;
      const user = await User.findById(userId);

      user.image = result.secure_url;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Uploaded !",
        data: result,
      });
    });
  }
);

export default router;
