import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "../utils/db.server";

const CACHE_KEY = "wikipedia:summary:Academy_Awards";
const TTL_MS = 6 * 60 * 60 * 1000;

export async function loader({ request }: LoaderFunctionArgs) {
  const now = Date.now();
  const existing = await prisma.externalCache.findUnique({
    where: { cacheKey: CACHE_KEY }
  });

  if (existing) {
    const age = now - new Date(existing.fetchedAt).getTime();
    if (age < TTL_MS) {
      return json(
        { source: "cache", fetchedAt: existing.fetchedAt, data: existing.json },
        {
          headers: {
            "Cache-Control": `public, max-age=${Math.floor((TTL_MS - age) / 1000)}`
          }
        }
      );
    }
  }

  const url = "https://en.wikipedia.org/api/rest_v1/page/summary/Academy_Awards";
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "oscars-pool-remix-dev/1.0"
    }
  });

  if (!resp.ok) {
    return json(
      {
        error: `Upstream fetch failed: ${resp.status} ${resp.statusText}`,
        url
      },
      { status: 502 }
    );
  }

  const data = await resp.json();

  await prisma.externalCache.upsert({
    where: { cacheKey: CACHE_KEY },
    create: { cacheKey: CACHE_KEY, json: data },
    update: { json: data, fetchedAt: new Date() }
  });

  return json(
    { source: "upstream", fetchedAt: new Date().toISOString(), data },
    {
      headers: {
        "Cache-Control": `public, max-age=${Math.floor(TTL_MS / 1000)}`
      }
    }
  );
}
