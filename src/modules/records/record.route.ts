import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import * as recordController from "./record.controller";

const router = Router();

router.use(authenticate);

router.post("/", authorize(Role.ADMIN), recordController.createRecord);
router.get("/", authorize(Role.ANALYST, Role.ADMIN), recordController.listRecords);
router.get("/:id", authorize(Role.ANALYST, Role.ADMIN), recordController.getRecordById);
router.patch("/:id", authorize(Role.ADMIN), recordController.updateRecord);
router.delete("/:id", authorize(Role.ADMIN), recordController.deleteRecord);

export default router;
