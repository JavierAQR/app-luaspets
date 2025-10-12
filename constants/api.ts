import axios from "axios";

export const API = axios.create({
  baseURL: "http://10.0.2.2:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});