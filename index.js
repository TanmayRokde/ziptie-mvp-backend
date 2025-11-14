require("dotenv").config();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const redisConfig = require("./src/config/redis");
const routes = require("./src/routes");

const defaultAllowedOrigins = [
  "https://ziptie-frontend-beta.vercel.app",
  "https://ziptie-frontend.vercel.app",
  "http://localhost:5173",
];

const parseOrigins = () => {
  const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const combined = [...defaultAllowedOrigins, ...envOrigins];
  const normalized = Array.from(
    new Set(combined.map((origin) => origin.replace(/\/$/, "")))
  ).filter(Boolean);

  return normalized;
};

const allowedOrigins = parseOrigins();
const allowAllOrigins = allowedOrigins.includes("*");

const normalizeOrigin = (origin = "") => origin.replace(/\/$/, "");

const corsOptions =
  allowedOrigins.length || allowAllOrigins
    ? {
        origin(origin, callback) {
          if (!origin) {
            return callback(null, true);
          }

          const normalizedOrigin = normalizeOrigin(origin);

          if (allowAllOrigins || allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true);
          }

          return callback(new Error("Not allowed by CORS"));
        },
      }
    : undefined;

const app = express();
const PORT = process.env.PORT || 3000;

redisConfig.connect();
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
