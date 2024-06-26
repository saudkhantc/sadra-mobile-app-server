import express from "express";
import { connectDB } from "./database/db.js";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/auth/user.routes.js";
import uploadRouter from "./routes/auth/image.upload.routes.js";
import routerError from "./routes/error/error.routes.js";

dotenv.config();

const port = process.env.port || 5000;
await connectDB();
app.use(cors());
app.use(express.json());
app.use("/api/auth/", userRouter);
app.use("/api/", uploadRouter);

app.use("/", routerError);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
  // console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
});
