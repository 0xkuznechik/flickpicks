/**
 * Security utilities for validating requests
 *
 * This module implements a three-layer security approach to prevent direct access
 * to the Fly.io deployment, requiring all traffic to go through Cloudflare:
 *
 * 1. Block direct fly.dev hostname access
 * 2. Verify CF-Ray header (confirms request went through Cloudflare)
 * 3. Verify shared secret header (confirms it's from YOUR Cloudflare account)
 */

/**
 * Middleware function to enforce Cloudflare-only traffic
 * Returns null if request is valid, or a Response to return to the client
 */
export function enforceCloudflareOnly(request: Request): Response | null {
  // Skip enforcement in development or if explicitly disabled
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DISABLE_CLOUDFLARE_CHECK === "true"
  ) {
    return null;
  }

  const host = request.headers.get("host") || "";
  const cfRay = request.headers.get("cf-ray");
  const cloudflareSecret = request.headers.get("x-cloudflare-secret");

  // Layer 1: Block direct fly.dev hostname access
  if (host.includes("fly.dev")) {
    console.warn("Direct fly.dev access attempt blocked:", {
      host,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
    });

    return new Response("Forbidden: Direct access not allowed.", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Layer 2: Verify request came through Cloudflare (CF-Ray header)
  if (!cfRay) {
    console.warn("Request missing CF-Ray header:", {
      host,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
    });

    return new Response("Forbidden: Invalid request origin.", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Layer 3: Verify shared secret matches
  // This secret should be set in Cloudflare Transform Rules and in your Fly.io env vars
  const expectedSecret = process.env.CLOUDFLARE_SECRET;

  if (!expectedSecret) {
    console.error("CLOUDFLARE_SECRET environment variable not set!");
    return new Response("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  if (cloudflareSecret !== expectedSecret) {
    console.warn("Invalid Cloudflare secret:", {
      host,
      url: request.url,
      cfRay,
      userAgent: request.headers.get("user-agent"),
    });

    return new Response("Forbidden: Unauthorized.", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // All checks passed - request is valid
  return null;
}
