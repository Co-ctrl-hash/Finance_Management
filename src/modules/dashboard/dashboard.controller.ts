import { NextFunction, Request, Response } from "express";
import {
  categoryTotalsQuerySchema,
  summaryQuerySchema,
  trendsQuerySchema,
} from "./dashboard.validation";
import * as dashboardService from "./dashboard.service";

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = summaryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query",
        errorCode: "INVALID_QUERY",
        details: parsed.error.issues,
      });
    }

    const data = await dashboardService.getSummary(parsed.data);
    return res.status(200).json({
      success: true,
      message: "Dashboard summary fetched",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const getTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = trendsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query",
        errorCode: "INVALID_QUERY",
        details: parsed.error.issues,
      });
    }

    const data = await dashboardService.getTrends(parsed.data);
    return res.status(200).json({
      success: true,
      message: "Dashboard trends fetched",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCategoryTotals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = categoryTotalsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query",
        errorCode: "INVALID_QUERY",
        details: parsed.error.issues,
      });
    }

    const data = await dashboardService.getCategoryTotals(parsed.data);
    return res.status(200).json({
      success: true,
      message: "Category totals fetched",
      data,
    });
  } catch (error) {
    return next(error);
  }
};
