import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";

import AppError from "./utils/AppError.js";
import globalErrorHandler from "./utils/errorController.js";

import userRouter from "./routes/userRouter.js";
import chatRouter from "./routes/chatRouter.js";
import messageRouter from "./routes/messageRouter.js";
import downloadRouter from "./routes/downloadRouter.js";
import postRouter from "./routes/postRouter.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // If using cookies or authentication
}));

app.use(cookieParser());
app.use(express.json());

// Serve static files from public/img/user directory
app.use('/img/user', express.static(path.join(__dirname, 'public', 'img', 'user')));

// API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/download", downloadRouter);
app.use("/api/v1/posts", postRouter);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError("TypeError", 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
