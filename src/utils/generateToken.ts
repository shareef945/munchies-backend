import jwt from "jsonwebtoken";

export function generateToken(
  password: string,
  userId: string,
  client: string
) {
  return jwt.sign({ userId, client }, password, { expiresIn: "1h" });
}
