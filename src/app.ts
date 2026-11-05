
import express from "express";
import cors from "cors";
import authRoutes from "../src/routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "TaskFlow Backend is running!",
  });
});

export default app;
