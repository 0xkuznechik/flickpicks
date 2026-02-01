import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
// Cloudflare security check - disabled for now but kept for future use
// import { enforceCloudflareOnly } from "./utils/security.server";

export default function handleRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext
) {
  // Cloudflare-only enforcement - disabled
  // const securityResponse = enforceCloudflareOnly(request);
  // if (securityResponse) {
  //   return securityResponse;
  // }

  const markup = renderToString(
    <RemixServer context={context} url={request.url} />
  );
  headers.set("Content-Type", "text/html");
  return new Response("<!DOCTYPE html>" + markup, {
    status: statusCode,
    headers,
  });
}
