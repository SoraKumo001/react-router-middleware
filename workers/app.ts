import {
  createRequestHandler,
  type unstable_RouterContext,
} from "react-router";

export default {
  async fetch(request, env, ctx) {
    // @ts-ignore
    const build = await import("../build/server/index.js");
    // @ts-ignore
    const requestHandler = createRequestHandler(build, import.meta.env?.MODE);
    return requestHandler(
      request,
      // When using unstable_middleware, no way to pass Cloudflare context is provided, so you have to force it in.
      // As for the Map key, if you use an instance of unstable_RouterContext, the one built with Vite and the one built with wrangler,
      // keys are different between the Vite-built and wrangler-built instances, so a string is used as the key.
      new Map([
        ["cloudflare" as unstable_RouterContext, { cloudflare: { env, ctx } }],
      ])
    );
  },
} satisfies ExportedHandler<Env>;
