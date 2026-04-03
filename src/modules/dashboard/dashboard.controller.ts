import { Request, Response } from "express";
import {
  categoryTotalsQuerySchema,
  summaryQuerySchema,
  trendsQuerySchema,
} from "./dashboard.validation";
import * as dashboardService from "./dashboard.service";
import { asyncHandler } from "../../utils/async-handler";
import { validateSchema } from "../../utils/validation";

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const query = validateSchema(summaryQuerySchema, req.query, "Invalid query", "INVALID_QUERY");

  const data = await dashboardService.getSummary(query);
  return res.status(200).json({
    success: true,
    message: "Dashboard summary fetched",
    data,
  });
});

export const getTrends = asyncHandler(async (req: Request, res: Response) => {
  const query = validateSchema(trendsQuerySchema, req.query, "Invalid query", "INVALID_QUERY");

  const data = await dashboardService.getTrends(query);
  return res.status(200).json({
    success: true,
    message: "Dashboard trends fetched",
    data,
  });
});

export const getCategoryTotals = asyncHandler(async (req: Request, res: Response) => {
  const query = validateSchema(
    categoryTotalsQuerySchema,
    req.query,
    "Invalid query",
    "INVALID_QUERY"
  );

  const data = await dashboardService.getCategoryTotals(query);
  return res.status(200).json({
    success: true,
    message: "Category totals fetched",
    data,
  });
});
