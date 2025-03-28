import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://my-chat-app-1-11jz.onrender.com/api",
  withCredentials: true,
});
