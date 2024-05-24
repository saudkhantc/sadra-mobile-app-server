import crypto from "crypto";

export function generateResetToken() {
  return crypto.randomBytes(20).toString("hex");
}
