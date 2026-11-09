import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/tasks", taskRoutes);

app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "TaskFlow Backend is running!",
  });
});

export default app;