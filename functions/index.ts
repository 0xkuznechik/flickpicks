// @ts-ignore - handled by Cloudflare's build engine
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// @ts-ignore
import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext: (context) => ({
    cloudflare: context.cloudflare,
  }),
});
