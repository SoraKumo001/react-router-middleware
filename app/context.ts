import { AsyncLocalStorage } from "node:async_hooks";
import type { unstable_RouterContext } from "react-router";

type context = {
  cloudflare: { env: Env };
};

export const asyncLocalStorage = new AsyncLocalStorage<context>();
export type CloudflareRouterContext = unstable_RouterContext<context>;
