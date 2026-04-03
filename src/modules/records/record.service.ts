import { Prisma, RecordType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import {
  CreateRecordInput,
  ListRecordsQueryInput,
  UpdateRecordInput,
} from "./record.validation";

const recordSelect = {
  id: true,
  amount: true,
  currency: true,
  type: true,
  category: true,
  date: true,
  notes: true,
  createdByUserId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FinancialRecordSelect;

export const createRecord = async (payload: CreateRecordInput, userId: string) => {
  return prisma.financialRecord.create({
    data: {
      amount: payload.amount,
      currency: payload.currency,
      type: payload.type,
      category: payload.category,
      date: new Date(payload.date),
      notes: payload.notes,
      createdByUserId: userId,
    },
    select: recordSelect,
  });
};

export const listRecords = async (query: ListRecordsQueryInput) => {
  const { type, category, fromDate, toDate, page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.FinancialRecordWhereInput = {
    isDeleted: false,
    ...(type ? { type } : {}),
    ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
    ...((fromDate || toDate)
      ? {
          date: {
            ...(fromDate ? { gte: new Date(fromDate) } : {}),
            ...(toDate ? { lte: new Date(toDate) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: recordSelect,
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getRecordById = async (id: string) => {
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
    select: recordSelect,
  });

  if (!record) {
    throw new AppError("Record not found", 404, "RECORD_NOT_FOUND");
  }

  return record;
};

export const updateRecord = async (id: string, payload: UpdateRecordInput) => {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Record not found", 404, "RECORD_NOT_FOUND");
  }

  return prisma.financialRecord.update({
    where: { id },
    data: {
      ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
      ...(payload.currency !== undefined ? { currency: payload.currency } : {}),
      ...(payload.type !== undefined ? { type: payload.type as RecordType } : {}),
      ...(payload.category !== undefined ? { category: payload.category } : {}),
      ...(payload.date !== undefined ? { date: new Date(payload.date) } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
    },
    select: recordSelect,
  });
};

export const deleteRecord = async (id: string) => {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Record not found", 404, "RECORD_NOT_FOUND");
  }

  await prisma.financialRecord.update({
    where: { id },
    data: { isDeleted: true },
  });
};
