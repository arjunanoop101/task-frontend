// src/api.js
import axios from "axios";

const API_BASE =
  // try Vite-style first
  import.meta.env.VITE_API_BASE_URL ||
  // then try REACT_APP_* (we defined it in vite.config.js)
  (typeof process !== "undefined"
    ? process.env.REACT_APP_API_BASE_URL
    : undefined) ||
  "http://localhost:3030";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

export default api;
