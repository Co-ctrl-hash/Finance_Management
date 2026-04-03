import { RecordType } from "@prisma/client";
import { z } from "zod";

const dateRangeBase = z
  .object({
    fromDate: z.iso.datetime().optional(),
    toDate: z.iso.datetime().optional(),
  })
  .refine(
    (data) =>
      !data.fromDate ||
      !data.toDate ||
      new Date(data.fromDate).getTime() <= new Date(data.toDate).getTime(),
    {
      message: "fromDate must be less than or equal to toDate",
      path: ["fromDate"],
    }
  );

export const summaryQuerySchema = dateRangeBase;

export const trendsQuerySchema = dateRangeBase.extend({
  period: z.enum(["weekly", "monthly"]).default("monthly"),
});

export const categoryTotalsQuerySchema = dateRangeBase.extend({
  type: z.enum(RecordType).optional(),
});

export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;
export type TrendsQueryInput = z.infer<typeof trendsQuerySchema>;
export type CategoryTotalsQueryInput = z.infer<typeof categoryTotalsQuerySchema>;
