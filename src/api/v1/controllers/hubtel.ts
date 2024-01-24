import { NextFunction, Request, Response } from "express";
import { STATUS_BAD_REQUEST, STATUS_OK } from "../../../config/config";
import { handleError } from "../middleware/error";


const getData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(STATUS_OK).json({
      message: "Data retrieved successfully",
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default { getData };
