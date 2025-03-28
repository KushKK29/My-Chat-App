import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config(); // Ensure env variables are loaded before using them

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware
app.use(cookieParser()); // Cookie-parser should be before cors for proper handling of credentials
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS Configuration
app.use(
  cors({
    origin: "https://my-chat-app-plum-psi.vercel.app",
    credentials: true,
    optionsSuccessStatus: 200, // Ensures proper handling of preflight requests
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  connectDB();
});
