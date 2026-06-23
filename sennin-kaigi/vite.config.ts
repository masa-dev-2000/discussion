import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 1420 は Tauri の既定 dev ポート。後で Tauri で包むときにそのまま使える。
export default defineConfig({
  plugins: [react()],
  server: { port: 1420, strictPort: false },
  clearScreen: false,
});
