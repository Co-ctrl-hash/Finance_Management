import { Role, UserStatus } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(100),
  role: z.enum(Role).default("VIEWER"),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(Role),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(UserStatus),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: z.enum(Role).optional(),
  status: z.enum(UserStatus).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
