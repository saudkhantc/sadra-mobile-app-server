import express from "express";
import upload from "../../middleware/multer.js";
import cloudinary from "../../cloudinary.config.js";
const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
  cloudinary.uploader.upload(req.file.path, async function (err, result) {
    if (err) {
      console.log(err);
      return res.status(404).json({
        success: false,
        message: "Profile image can't be uploaded try again",
      });
    }
    res.status(200).json({
      success: true,
      message: "Uploaded !",
      data: result,
    });
  });
});

export default router;
