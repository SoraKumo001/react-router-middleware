import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ isSsrBuild, mode }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./workers/app.ts",
        }
      : undefined,
  },

  plugins: [
    mode === "development" &&
      cloudflare({
        configPath: "wrangler.dev.toml",
      }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
}));
