import { Request, Response } from "express";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "./user.validation";
import * as userService from "./user.service";
import { asyncHandler } from "../../utils/async-handler";
import { validateSchema } from "../../utils/validation";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const input = validateSchema(
    createUserSchema,
    req.body,
    "Validation failed",
    "VALIDATION_ERROR"
  );

  const data = await userService.createUser(input);
  return res.status(201).json({
    success: true,
    message: "User created",
    data,
  });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = validateSchema(listUsersQuerySchema, req.query, "Invalid query", "INVALID_QUERY");

  const data = await userService.listUsers(query);
  return res.status(200).json({
    success: true,
    message: "Users fetched",
    data,
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const input = validateSchema(
    updateUserRoleSchema,
    req.body,
    "Validation failed",
    "VALIDATION_ERROR"
  );

  const data = await userService.updateUserRole(userId, input.role);
  return res.status(200).json({
    success: true,
    message: "User role updated",
    data,
  });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const input = validateSchema(
    updateUserStatusSchema,
    req.body,
    "Validation failed",
    "VALIDATION_ERROR"
  );

  const data = await userService.updateUserStatus(userId, input.status);
  return res.status(200).json({
    success: true,
    message: "User status updated",
    data,
  });
});
