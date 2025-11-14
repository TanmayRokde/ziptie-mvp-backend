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

console.log("[cors] allowed origins:", allowedOrigins);

const corsOptions =
  allowedOrigins.length || allowAllOrigins
    ? {
        origin(origin, callback) {
          console.log("[cors] request origin:", origin || "<none>");

          if (!origin) {
            return callback(null, true);
          }

          const normalizedOrigin = normalizeOrigin(origin);
          console.log("[cors] normalized origin:", normalizedOrigin);

          if (allowAllOrigins || allowedOrigins.includes(normalizedOrigin)) {
            console.log("[cors] origin allowed");
            return callback(null, true);
          }

          console.warn("[cors] origin rejected:", normalizedOrigin);
          return callback(new Error("Not allowed by CORS"));
        },
      }
    : undefined;

const app = express();
const PORT = process.env.PORT || 3000;

redisConfig.connect();
app.use(helmet());
app.use((req, res, next) => {
  console.log("[request]", req.method, req.originalUrl, "origin:", req.headers.origin || "<none>");
  next();
});
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    console.warn("[cors] blocking request for origin:", req.headers.origin);
    return res.status(403).json({ message: "Not allowed by CORS" });
  }

  if (err) {
    console.error("[server:error]", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  return next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
