import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: {
      type: String,
      default:
        "http://res.cloudinary.com/dobkvroor/image/upload/v1716379985/azih7ft43bdg6g550lln.svg",
    },
    bio: { type: String, required: false },
    token: { type: String, required: false },
  },
  { timestamps: true }
);

const user = model("User", userSchema);
export default user;
