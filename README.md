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
  },
} satisfies Config;
```

## workers/getLoadContext.ts

```ts
import type { unstable_RouterContext } from "react-router";

export const middlewareContext = "Cloudflare" as unstable_RouterContext<{
  cloudflare: { env: object };
}>;
export const getLoadContext = ({ context }: { context: unknown }) => {
  return new Map([[middlewareContext, context]]) as never;
};
```

## vite.config.ts

```ts
import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./workers/getLoadContext";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./workers/app.ts",
        }
      : undefined,
  },
  plugins: [
    cloudflareDevProxy({
      getLoadContext, // add getLoadContext here
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
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

export default function Index() {
  const server = useLoaderData<string>();
  const client = useRootContext();
  return (
    <div>
      <div className="text-blue-600">Client:</div>
      <pre>{JSON.stringify(client, null, 2)}</pre>
      <hr />
      <div className="text-red-600">Server:</div>
      <pre>{server}</pre>
    </div>
  );
}

export const loader = () => {
  const value = JSON.stringify(
    asyncLocalStorage.getStore()?.cloudflare.env,
    null,
    2
  );
  return value;
};
```
