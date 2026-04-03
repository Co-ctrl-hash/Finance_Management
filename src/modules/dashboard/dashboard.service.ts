import { Prisma, RecordType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import {
  CategoryTotalsQueryInput,
  SummaryQueryInput,
  TrendsQueryInput,
} from "./dashboard.validation";

const buildWhere = (fromDate?: string, toDate?: string): Prisma.FinancialRecordWhereInput => ({
  isDeleted: false,
  ...((fromDate || toDate)
    ? {
        date: {
          ...(fromDate ? { gte: new Date(fromDate) } : {}),
          ...(toDate ? { lte: new Date(toDate) } : {}),
        },
      }
    : {}),
});

export const getSummary = async (query: SummaryQueryInput) => {
  const where = buildWhere(query.fromDate, query.toDate);

  const [incomeAgg, expenseAgg, recentActivityCount] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { ...where, type: RecordType.INCOME },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: { ...where, type: RecordType.EXPENSE },
      _sum: { amount: true },
    }),
    prisma.financialRecord.count({
      where,
    }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpense = Number(expenseAgg._sum.amount ?? 0);

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    recentActivityCount,
  };
};

const getWeekStartUtc = (date: Date) => {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const diff = (day + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - diff);
  return utc;
};

export const getTrends = async (query: TrendsQueryInput) => {
  const where = buildWhere(query.fromDate, query.toDate);

  const records = await prisma.financialRecord.findMany({
    where,
    orderBy: { date: "asc" },
    select: {
      date: true,
      amount: true,
      type: true,
    },
  });

  const bucketMap = new Map<string, { income: number; expense: number }>();

  for (const record of records) {
    const d = new Date(record.date);
    const bucket =
      query.period === "weekly"
        ? getWeekStartUtc(d).toISOString().slice(0, 10)
        : `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    const existing = bucketMap.get(bucket) ?? { income: 0, expense: 0 };
    const amount = Number(record.amount);

    if (record.type === RecordType.INCOME) {
      existing.income += amount;
    } else {
      existing.expense += amount;
    }

    bucketMap.set(bucket, existing);
  }

  return Array.from(bucketMap.entries()).map(([bucket, totals]) => ({
    bucket,
    income: totals.income,
    expense: totals.expense,
    net: totals.income - totals.expense,
  }));
};

export const getCategoryTotals = async (query: CategoryTotalsQueryInput) => {
  const where: Prisma.FinancialRecordWhereInput = {
    ...buildWhere(query.fromDate, query.toDate),
    ...(query.type ? { type: query.type } : {}),
  };

  const rows = await prisma.financialRecord.groupBy({
    by: ["category"],
    where,
    _sum: { amount: true },
    orderBy: {
      _sum: { amount: "desc" },
    },
  });

  return rows.map((row) => ({
    category: row.category,
    total: Number(row._sum.amount ?? 0),
  }));
};
