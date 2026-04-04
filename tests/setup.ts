import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Prefer .env.test for integration runs to isolate test database data.
const envTestPath = path.resolve(process.cwd(), ".env.test");
if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
}

// Fallback to .env for any missing values.
dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-jwt-secret";
}

if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = "1d";
}
