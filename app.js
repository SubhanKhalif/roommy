import express from "express";
const app = express();
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./utils/errorController.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import chatRouter from "./routes/chatRouter.js";
import messageRouter from "./routes/messageRouter.js";
import downloadRouter from "./routes/downloadRouter.js";
import postRouter from "./routes/postRouter.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure CORS and static files
app.use(cors({ origin: ["http://localhost:3000", "https://roommies.vercel.app"] }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use('/img/user', express.static(path.join(__dirname, 'public', 'img', 'user')));

// Middleware
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/download", downloadRouter);
app.use("/api/v1/posts", postRouter);

// Error handling
app.all("*", (req, res, next) => {
  next(new AppError("TypeError", 404));
});
app.use(globalErrorHandler);

export default app;
