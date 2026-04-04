import dotenv from "dotenv";

// Load existing workspace env for test execution.
dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-jwt-secret";
}

if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = "1d";
}
