import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import axios from "axios";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";
import { checkAuth } from "./controllers/auth.controller.js";
import { protectRoute } from "./middleware/auth.middleware.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin:
      ["https://my-chat-app-plum-psi.vercel.app",
      "http://localhost:5173"],
    credentials: true,
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

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is alive!" });
});

app.get("/check", (req, res, next) => {
  try {
    protectRoute(req, res, () => checkAuth(req, res));
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});


// Keep-Alive Mechanism (Pings server every 15 minutes)
const KEEP_ALIVE_URL =
  process.env.NODE_ENV === "production"
    ? "https://my-chat-app-1-11jz.onrender.com/health"
    : `http://localhost:${PORT}/health`;

setInterval(async () => {
  try {
    const response = await axios.get(KEEP_ALIVE_URL);
    console.log("Keep-alive ping successful:", response.status);
  } catch (error) {
    console.error("Keep-alive failed:", error.message);
  }
}, 15 * 60 * 1000); // Runs every 15 minutes

server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});
