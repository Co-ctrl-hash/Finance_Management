import { Request, Response } from "express";
import {
  createRecordSchema,
  listRecordsQuerySchema,
  updateRecordSchema,
} from "./record.validation";
import * as recordService from "./record.service";
import { asyncHandler } from "../../utils/async-handler";
import { validateSchema } from "../../utils/validation";

export const createRecord = asyncHandler(async (req: Request, res: Response) => {
  const input = validateSchema(
    createRecordSchema,
    req.body,
    "Validation failed",
    "VALIDATION_ERROR"
  );

  const data = await recordService.createRecord(input, req.user!.id);
  return res.status(201).json({
    success: true,
    message: "Record created",
    data,
  });
});

export const listRecords = asyncHandler(async (req: Request, res: Response) => {
  const query = validateSchema(listRecordsQuerySchema, req.query, "Invalid query", "INVALID_QUERY");

  const data = await recordService.listRecords(query);
  return res.status(200).json({
    success: true,
    message: "Records fetched",
    data,
  });
});

export const getRecordById = asyncHandler(async (req: Request, res: Response) => {
  const recordId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const data = await recordService.getRecordById(recordId);

  return res.status(200).json({
    success: true,
    message: "Record fetched",
    data,
  });
});

export const updateRecord = asyncHandler(async (req: Request, res: Response) => {
  const recordId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const input = validateSchema(
    updateRecordSchema,
    req.body,
    "Validation failed",
    "VALIDATION_ERROR"
  );

  const data = await recordService.updateRecord(recordId, input);
  return res.status(200).json({
    success: true,
    message: "Record updated",
    data,
  });
});

export const deleteRecord = asyncHandler(async (req: Request, res: Response) => {
  const recordId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await recordService.deleteRecord(recordId);

  return res.status(200).json({
    success: true,
    message: "Record deleted",
    data: null,
  });
});
