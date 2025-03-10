import { AsyncLocalStorage } from "node:async_hooks";
import type { unstable_RouterContext } from "react-router";

export const asyncLocalStorage = new AsyncLocalStorage<{
  cloudflare: { env: object };
}>();

export type CloudflareRouterContext = unstable_RouterContext<{
  cloudflare: { env: Env };
}>;
