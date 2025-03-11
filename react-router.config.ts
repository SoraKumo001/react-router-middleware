import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  future: {
    unstable_middleware: true, // Required to run middleware
    unstable_optimizeDeps: true, // Consistency of React instances during development mode execution.
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
