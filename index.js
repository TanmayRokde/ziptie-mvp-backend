require("dotenv").config();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const redisConfig = require("./src/config/redis");
const routes = require("./src/routes");

console.log("[cors] allowing all origins for testing");

const app = express();
const PORT = process.env.PORT || 3000;

redisConfig.connect();
app.use(helmet());
app.use((req, res, next) => {
  console.log("[request]", req.method, req.originalUrl, "origin:", req.headers.origin || "<none>");

  const origin = req.headers.origin;
  res.header("Access-Control-Allow-Origin", origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type, Authorization"
  );
  res.header("Vary", "Origin");

  if (req.method === "OPTIONS") {
    console.log("[request] handling OPTIONS preflight for", req.originalUrl);
    const normalizedOrigin = normalizeOrigin(origin || "");
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "ziptie backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
