import { defineConfig } from "vite";
import vinext from "vinext";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/postcss";
import { fileURLToPath } from "node:url";

// Keep the app and local Cloudflare build intact; package Vercel functions
// and static assets with Vinext's supported Nitro deployment adapter.
export default defineConfig({
  resolve: { alias: { tailwindcss: fileURLToPath(new URL("./node_modules/tailwindcss/index.css", import.meta.url)) } },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [vinext(), nitro({ preset: "vercel" })],
});
