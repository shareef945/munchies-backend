import jwt from "jsonwebtoken";
import { API_SECRET } from "../config/config";
import { tokenPayload } from "../api/v1/models/auth";

export function generateToken(password: string, userId: string, client: string) {
  return jwt.sign({ userId, client }, password, { expiresIn: "1h" });
}

export function generateRefreshToken(userId: string, client: string) {
  return jwt.sign({ userId, client }, API_SECRET!, { expiresIn: "30d" });
}

export function verifyRefreshToken(refreshToken: string, userId: string) {
  try {
    const decoded = jwt.verify(refreshToken, API_SECRET!) as tokenPayload;
    return decoded.userId === userId;
  } catch (err) {
    // Token is not valid or expired
    return false;
  }
}
