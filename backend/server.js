import express from "express";
import cors from "cors";
import "dotenv/config";
import { connect } from "mongoose";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";


const app = express();
const PORT = 4000;

app.use(cors());

//CONNECT DB
connectDB();

//MIDDLEWARE
app.use(express.json());

app.use("/api/auth", userRoutes);

//ROUTES
app.get("/", (req, res) => {
  res.send("API is running...");
});

//START SERVER

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
