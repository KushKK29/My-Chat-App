import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "https://my-chat-app-1-11jz.onrender.com/api",
  withCredentials: true,
});
