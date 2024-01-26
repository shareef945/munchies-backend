import { NextFunction, Request, Response } from "express";
import { generateToken } from "../../../utils/generateToken";
import { API_PASSWORD, INVALID_PASSWORD_MASSAGE } from "../../../config/config";

/** GENERATE TOKEN */
 const generateAToken = async (req: Request, res: Response, next: NextFunction) => {
  const correctPassword = API_PASSWORD;
  if (req.body.Password !== correctPassword) {
    return res.status(401).json({ message: INVALID_PASSWORD_MASSAGE });
  }
  const token = generateToken(req.body.Password, "admin", "admin");
  res.json({ token });
};

export default { generateAToken };