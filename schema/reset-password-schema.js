import mongoose from "mongoose";
const { Schema, model } = mongoose;

const passwordResetSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const PasswordReset = model("PasswordReset", passwordResetSchema);
export default PasswordReset;
