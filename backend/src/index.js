import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import axios from "axios";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
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
