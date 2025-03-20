import type { Config } from "@react-router/dev/config";
import type { Future } from "react-router";

declare module "react-router" {
  interface Future {
    unstable_middleware: true; // 👈 Enable middleware types
  }
}

export default {
  ssr: true,
  future: {
    unstable_middleware: true, // Required to run middleware
    unstable_optimizeDeps: true, // Consistency of React instances during development mode execution.
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
