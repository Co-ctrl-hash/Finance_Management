import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRouter from "./routes/health.routes";
import authRouter from "./modules/auth/auth.route";
import userRouter from "./modules/users/user.route";
import recordRouter from "./modules/records/record.route";
import dashboardRouter from "./modules/dashboard/dashboard.route";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { globalErrorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/records", recordRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;