import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

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

// Keep-Alive Mechanism (Pings server every 15 minutes)
const KEEP_ALIVE_URL =
  process.env.NODE_ENV === "production"
    ? "https://my-chat-app-uhe2.onrender.com/health"
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
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
