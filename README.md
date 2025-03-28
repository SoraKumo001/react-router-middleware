# react-router-middleware

## app/global.d.ts

```ts
import type { Future } from "react-router";

declare module "react-router" {
  interface Future {
    unstable_middleware: true; // 👈 Enable middleware types
  }
}
```

## react-router.config.ts

```ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  future: {
    unstable_middleware: true, // Required to run middleware
    unstable_optimizeDeps: true, // Consistency of React instances during development mode execution.
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
```

## vite.config.ts

```ts
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(() => ({
  resolve: {
    alias: [
      {
        find: "../build/server/index.js",
        replacement: "virtual:react-router/server-build",
      },
    ],
  },
  plugins: [cloudflare(), tailwindcss(), reactRouter(), tsconfigPaths()],
}));
```

## app/context.ts

```ts
// Need to add @types/node
import { AsyncLocalStorage } from "node:async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage<{
  cloudflare: { env: object };
}>();
```

## app/root.ts

```ts
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    //add RootProvider hire
    <RootProvider>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
          {/* add RootValue here  */}
          <RootValue />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </RootProvider>
  );
}

// add middleware
export const unstable_middleware: unstable_MiddlewareFunction[] = [
  ({ context }, next) =>
    asyncLocalStorage.run(context.get(middlewareContext), next),
];
```

## routes/home.tsx

```tsx
import { useLoaderData } from "react-router";
import { useRootContext } from "remix-provider";
import { asyncLocalStorage } from "~/context";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export default function Index() {
  const server = useLoaderData<string>();
  const client = useRootContext();
  return (
    <div>
      <div className="text-blue-600">Client:</div>
      <pre>{JSON.stringify({ env: client }, null, 2)}</pre>
      <hr />
      <div className="text-red-600">Server:</div>
      <pre>{server}</pre>
    </div>
  );
}

export const loader = async () => {
  const env = asyncLocalStorage.getStore()?.cloudflare.env as {
    DATABASE_URL: string;
  };

  const url = new URL(env.DATABASE_URL);
  const schema = url.searchParams.get("schema") ?? undefined;
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool, { schema });
  const prisma = new PrismaClient({ adapter });
  await prisma.test.create({ data: {} });
  const value = await prisma.test
    .findMany({ where: {} })
    .then((r) => r.map(({ id }) => id));
  return JSON.stringify({ env, prisma: value }, null, 2);
};
```

## workers/app.ts

```ts
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
```
