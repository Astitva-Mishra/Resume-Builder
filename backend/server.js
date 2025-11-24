import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();
const PORT = 4000;

app.use(cors());

//CONNECT DB
connectDB();

//MIDDLEWARE
app.use(express.json());
// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Simple request logger to help debug missing routes
app.use((req, res, next) => {
  console.log("[HTTP]", req.method, req.originalUrl);
  next();
});

app.use("/api/auth", userRoutes);
app.use("/api/resume", resumeRoutes);

//ROUTES
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 404 logger for unmatched routes
app.use((req, res, next) => {
  console.warn("No route matched for", req.method, req.originalUrl);
  res.status(404).json({ message: "Not Found" });
});

//START SERVER

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
