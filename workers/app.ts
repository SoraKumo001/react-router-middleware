import { createRequestHandler } from "react-router";
import { getLoadContext } from "./getLoadContext";

declare global {
  interface CloudflareEnvironment extends Env {}
}

const requestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  fetch(request, env, ctx) {
    return requestHandler(
      request,
      getLoadContext({ context: { cloudflare: { env, ctx } } })
    );
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
