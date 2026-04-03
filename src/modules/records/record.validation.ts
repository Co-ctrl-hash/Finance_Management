import { RecordType } from "@prisma/client";
import { z } from "zod";

export const createRecordSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().trim().min(1).default("INR"),
  type: z.enum(RecordType),
  category: z.string().trim().min(1).max(100),
  date: z.iso.datetime(),
  notes: z.string().trim().max(500).optional(),
});

export const updateRecordSchema = createRecordSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

export const listRecordsQuerySchema = z.object({
  type: z.enum(RecordType).optional(),
  category: z.string().trim().min(1).optional(),
  fromDate: z.iso.datetime().optional(),
  toDate: z.iso.datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["date", "amount", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type ListRecordsQueryInput = z.infer<typeof listRecordsQuerySchema>;
