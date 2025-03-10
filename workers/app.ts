import { createRequestHandler } from "react-router";

declare global {
  interface CloudflareEnvironment extends Env {
    DATABASE_URL: string;
  }
}
const requestHandler = createRequestHandler(
  await import(
    import.meta.env
      ? "virtual:react-router/server-build"
      : "../build/server/index.js"
  ).catch(),
  import.meta.env?.MODE
);

export default {
  fetch(request, env, ctx) {
    return requestHandler(
      request,
      // When using unstable_middleware, no way to pass Cloudflare context is provided, so you have to force it in.
      // Also, as of 7.3.0, the type definition for this part is wrong, so you have to use never to get around it.
      // As for the Map key, if you use an instance of unstable_RouterContext, the one built with Vite and the one built with wrangler,
      // keys are different between the Vite-built and wrangler-built instances, so a string is used as the key.
      new Map([["cloudflare", { cloudflare: { env, ctx } }]]) as never
    );
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
