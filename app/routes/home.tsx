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
