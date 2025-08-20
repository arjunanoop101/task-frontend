import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
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
