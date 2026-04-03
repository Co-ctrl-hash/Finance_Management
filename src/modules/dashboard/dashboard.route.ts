import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import * as dashboardController from "./dashboard.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/summary",
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  dashboardController.getSummary
);

router.get(
  "/trends",
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  dashboardController.getTrends
);

router.get(
  "/category-totals",
  authorize(Role.ANALYST, Role.ADMIN),
  dashboardController.getCategoryTotals
);

export default router;
