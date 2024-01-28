import { NextFunction, Request, Response } from "express";
import { STATUS_BAD_REQUEST, STATUS_OK } from "../../../config/config";
import { supabase } from "../../../server";
import { formatDateQuery } from "../../../utils/utils";

const getData = async (req: Request, res: Response, next: NextFunction) => {
  const { data: hubtel_transactions, error } = await supabase
    .from("hubtel-transactions")
    .select("*");
  if (error) {
    console.error("Supabase query error:", error);
    throw error;
  }
  return res.status(STATUS_OK).json({
    message: "Data retrieved successfully",
    totalRevenue: hubtel_transactions.reduce(
      (acc: any, curr: any) => acc + curr["Amount After Charges"],
      0
    ),
    totalQuantity: hubtel_transactions.length,
    data: hubtel_transactions,
  });
};

const getDataBetweenDates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { from, to } = req.query;

  if (!from && !to) {
    return getData(req, res, next);
  }

  const formattedFromDate = formatDateQuery(from as string);
  const formattedToDate = formatDateQuery(to as string);

  const { data: hubtel_transactions, error } = await supabase
    .from("hubtel-transactions")
    .select("*")
    .gte("Date", formattedFromDate)
    .lte("Date", formattedToDate);
  if (error) {
    console.error("Supabase query error:", error);
    return res.status(500).json({ error: "Database query failed" });
  }
  return res.status(STATUS_OK).json({
    message: "Data retrieved successfully",
    totalRevenue: hubtel_transactions.reduce(
      (acc: any, curr: any) => acc + curr["Amount After Charges"],
      0
    ),
    totalQuantity: hubtel_transactions.length,
    data: hubtel_transactions,
  });
};

export default { getData, getDataBetweenDates };
