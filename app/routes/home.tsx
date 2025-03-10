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
