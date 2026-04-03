import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import * as userController from "./user.controller";

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.post("/", userController.createUser);
router.get("/", userController.listUsers);
router.patch("/:id/role", userController.updateUserRole);
router.patch("/:id/status", userController.updateUserStatus);

export default router;
