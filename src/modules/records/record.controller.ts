import { NextFunction, Request, Response } from "express";
import {
  createRecordSchema,
  listRecordsQuerySchema,
  updateRecordSchema,
} from "./record.validation";
import * as recordService from "./record.service";

export const createRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        details: parsed.error.issues,
      });
    }

    const data = await recordService.createRecord(parsed.data, req.user!.id);
    return res.status(201).json({
      success: true,
      message: "Record created",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const listRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = listRecordsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query",
        errorCode: "INVALID_QUERY",
        details: parsed.error.issues,
      });
    }

    const data = await recordService.listRecords(parsed.data);
    return res.status(200).json({
      success: true,
      message: "Records fetched",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const getRecordById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recordId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await recordService.getRecordById(recordId);

    return res.status(200).json({
      success: true,
      message: "Record fetched",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recordId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const parsed = updateRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        details: parsed.error.issues,
      });
    }

    const data = await recordService.updateRecord(recordId, parsed.data);
    return res.status(200).json({
      success: true,
      message: "Record updated",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recordId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await recordService.deleteRecord(recordId);

    return res.status(200).json({
      success: true,
      message: "Record deleted",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};
