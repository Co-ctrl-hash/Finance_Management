import { NextFunction, Request, Response } from "express";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "./user.validation";
import * as userService from "./user.service";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        details: parsed.error.issues,
      });
    }

    const data = await userService.createUser(parsed.data);
    return res.status(201).json({
      success: true,
      message: "User created",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query",
        errorCode: "INVALID_QUERY",
        details: parsed.error.issues,
      });
    }

    const data = await userService.listUsers(parsed.data);
    return res.status(200).json({
      success: true,
      message: "Users fetched",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const parsed = updateUserRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        details: parsed.error.issues,
      });
    }

    const data = await userService.updateUserRole(userId, parsed.data.role);
    return res.status(200).json({
      success: true,
      message: "User role updated",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const parsed = updateUserStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        details: parsed.error.issues,
      });
    }

    const data = await userService.updateUserStatus(userId, parsed.data.status);
    return res.status(200).json({
      success: true,
      message: "User status updated",
      data,
    });
  } catch (error) {
    return next(error);
  }
};
