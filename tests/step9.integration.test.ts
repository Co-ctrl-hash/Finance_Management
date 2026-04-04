import request from "supertest";
import { Role, UserStatus } from "@prisma/client";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/utils/password";

type LoginResult = {
  token: string;
};

const users = {
  admin: {
    name: "Step9 Admin",
    email: "step9.admin@finance.local",
    password: "Step9@123",
    role: Role.ADMIN,
  },
  analyst: {
    name: "Step9 Analyst",
    email: "step9.analyst@finance.local",
    password: "Step9@123",
    role: Role.ANALYST,
  },
  viewer: {
    name: "Step9 Viewer",
    email: "step9.viewer@finance.local",
    password: "Step9@123",
    role: Role.VIEWER,
  },
};

const resetTestData = async () => {
  await prisma.financialRecord.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: { in: [users.admin.email, users.analyst.email, users.viewer.email] },
    },
  });

  const [adminPasswordHash, analystPasswordHash, viewerPasswordHash] = await Promise.all([
    hashPassword(users.admin.password),
    hashPassword(users.analyst.password),
    hashPassword(users.viewer.password),
  ]);

  await prisma.user.createMany({
    data: [
      {
        name: users.admin.name,
        email: users.admin.email,
        passwordHash: adminPasswordHash,
        role: users.admin.role,
        status: UserStatus.ACTIVE,
      },
      {
        name: users.analyst.name,
        email: users.analyst.email,
        passwordHash: analystPasswordHash,
        role: users.analyst.role,
        status: UserStatus.ACTIVE,
      },
      {
        name: users.viewer.name,
        email: users.viewer.email,
        passwordHash: viewerPasswordHash,
        role: users.viewer.role,
        status: UserStatus.ACTIVE,
      },
    ],
  });
};

const login = async (email: string, password: string): Promise<LoginResult> => {
  const response = await request(app).post("/api/v1/auth/login").send({ email, password });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data?.accessToken).toBeTruthy();

  return { token: response.body.data.accessToken as string };
};

beforeAll(async () => {
  await resetTestData();
});

beforeEach(async () => {
  await prisma.financialRecord.deleteMany({});
});

afterAll(async () => {
  await prisma.financialRecord.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: { in: [users.admin.email, users.analyst.email, users.viewer.email] },
    },
  });
  await prisma.$disconnect();
});

describe("Step 9 integration tests", () => {
  it("auth: should login with valid credentials and reject invalid credentials", async () => {
    const ok = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: users.admin.email, password: users.admin.password });

    expect(ok.status).toBe(200);
    expect(ok.body.success).toBe(true);
    expect(ok.body.data.user.email).toBe(users.admin.email);

    const fail = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: users.admin.email, password: "wrong-password" });

    expect(fail.status).toBe(401);
    expect(fail.body.success).toBe(false);
    expect(fail.body.errorCode).toBe("INVALID_CREDENTIALS");
  });

  it("rbac: should enforce admin/analyst/viewer permissions on records", async () => {
    const admin = await login(users.admin.email, users.admin.password);
    const analyst = await login(users.analyst.email, users.analyst.password);
    const viewer = await login(users.viewer.email, users.viewer.password);

    const adminCreate = await request(app)
      .post("/api/v1/records")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        amount: 1200,
        currency: "INR",
        type: "INCOME",
        category: "Salary",
        date: new Date("2026-04-01T00:00:00.000Z").toISOString(),
      });

    expect(adminCreate.status).toBe(201);
    expect(adminCreate.body.success).toBe(true);

    const analystCreate = await request(app)
      .post("/api/v1/records")
      .set("Authorization", `Bearer ${analyst.token}`)
      .send({
        amount: 100,
        currency: "INR",
        type: "EXPENSE",
        category: "Food",
        date: new Date("2026-04-02T00:00:00.000Z").toISOString(),
      });

    expect(analystCreate.status).toBe(403);
    expect(analystCreate.body.errorCode).toBe("FORBIDDEN");

    const analystList = await request(app)
      .get("/api/v1/records")
      .set("Authorization", `Bearer ${analyst.token}`);

    expect(analystList.status).toBe(200);
    expect(Array.isArray(analystList.body.data.items)).toBe(true);

    const viewerList = await request(app)
      .get("/api/v1/records")
      .set("Authorization", `Bearer ${viewer.token}`);

    expect(viewerList.status).toBe(403);
    expect(viewerList.body.errorCode).toBe("FORBIDDEN");
  });

  it("records: should support create, update, soft-delete, and hide deleted records", async () => {
    const admin = await login(users.admin.email, users.admin.password);

    const created = await request(app)
      .post("/api/v1/records")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        amount: 500,
        currency: "INR",
        type: "EXPENSE",
        category: "Transport",
        date: new Date("2026-04-03T00:00:00.000Z").toISOString(),
        notes: "Cab rides",
      });

    expect(created.status).toBe(201);
    const recordId = created.body.data.id as string;

    const updated = await request(app)
      .patch(`/api/v1/records/${recordId}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ category: "Travel" });

    expect(updated.status).toBe(200);
    expect(updated.body.data.category).toBe("Travel");

    const deleted = await request(app)
      .delete(`/api/v1/records/${recordId}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.success).toBe(true);

    const getDeleted = await request(app)
      .get(`/api/v1/records/${recordId}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(getDeleted.status).toBe(404);
    expect(getDeleted.body.errorCode).toBe("RECORD_NOT_FOUND");

    const listed = await request(app)
      .get("/api/v1/records")
      .set("Authorization", `Bearer ${admin.token}`);

    expect(listed.status).toBe(200);
    expect(listed.body.data.items).toHaveLength(0);
  });

  it("dashboard: should return summary, trends, and category totals", async () => {
    const admin = await login(users.admin.email, users.admin.password);
    const analyst = await login(users.analyst.email, users.analyst.password);
    const viewer = await login(users.viewer.email, users.viewer.password);

    const records = [
      {
        amount: 3000,
        type: "INCOME",
        category: "Salary",
        date: "2026-04-01T00:00:00.000Z",
      },
      {
        amount: 600,
        type: "EXPENSE",
        category: "Groceries",
        date: "2026-04-02T00:00:00.000Z",
      },
      {
        amount: 400,
        type: "EXPENSE",
        category: "Transport",
        date: "2026-04-03T00:00:00.000Z",
      },
    ];

    for (const record of records) {
      const response = await request(app)
        .post("/api/v1/records")
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ ...record, currency: "INR" });

      expect(response.status).toBe(201);
    }

    const summary = await request(app)
      .get("/api/v1/dashboard/summary")
      .set("Authorization", `Bearer ${viewer.token}`)
      .query({
        fromDate: "2026-04-01T00:00:00.000Z",
        toDate: "2026-04-30T23:59:59.999Z",
      });

    expect(summary.status).toBe(200);
    expect(summary.body.data.totalIncome).toBe(3000);
    expect(summary.body.data.totalExpense).toBe(1000);
    expect(summary.body.data.netBalance).toBe(2000);

    const trends = await request(app)
      .get("/api/v1/dashboard/trends")
      .set("Authorization", `Bearer ${viewer.token}`)
      .query({ period: "monthly" });

    expect(trends.status).toBe(200);
    expect(Array.isArray(trends.body.data)).toBe(true);
    expect(trends.body.data.length).toBeGreaterThan(0);

    const categoryTotalsAsAnalyst = await request(app)
      .get("/api/v1/dashboard/category-totals")
      .set("Authorization", `Bearer ${analyst.token}`)
      .query({ type: "EXPENSE" });

    expect(categoryTotalsAsAnalyst.status).toBe(200);
    expect(Array.isArray(categoryTotalsAsAnalyst.body.data)).toBe(true);
    expect(
      categoryTotalsAsAnalyst.body.data.some((row: { category: string }) => row.category === "Groceries")
    ).toBe(true);

    const categoryTotalsAsViewer = await request(app)
      .get("/api/v1/dashboard/category-totals")
      .set("Authorization", `Bearer ${viewer.token}`)
      .query({ type: "EXPENSE" });

    expect(categoryTotalsAsViewer.status).toBe(403);
    expect(categoryTotalsAsViewer.body.errorCode).toBe("FORBIDDEN");
  });
});
