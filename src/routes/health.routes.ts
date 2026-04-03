import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    data: { uptime: process.uptime() },
  });
});

export default router;