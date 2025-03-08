import type { unstable_RouterContext } from "react-router";

export const middlewareContext = "Cloudflare" as unstable_RouterContext<{
  cloudflare: { env: object };
}>;
export const getLoadContext = ({ context }: { context: unknown }) => {
  return new Map([[middlewareContext, context]]) as never;
};
