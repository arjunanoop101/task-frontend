// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  // load .env files
  const env = loadEnv(mode, process.cwd());
  // Put REACT_APP_API_BASE_URL into process.env and into import.meta.env
  process.env.REACT_APP_API_BASE_URL = env.REACT_APP_API_BASE_URL;

  return defineConfig({
    plugins: [react()],
    define: {
      // expose for code that reads process.env.REACT_APP_API_BASE_URL
      "process.env.REACT_APP_API_BASE_URL": JSON.stringify(
        env.REACT_APP_API_BASE_URL
      ),
      // optionally expose VITE_API_BASE_URL if you want
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        env.VITE_API_BASE_URL || env.REACT_APP_API_BASE_URL
      ),
    },
  });
};
