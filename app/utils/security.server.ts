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
  // Skip checks in development
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  // Skip checks if explicitly disabled
  if (process.env.DISABLE_CLOUDFLARE_CHECK === "true") {
    return null;
  }

  const url = new URL(request.url);
  const host = url.hostname;

  // Block direct fly.dev access
  if (host.endsWith(".fly.dev")) {
    console.warn("Direct fly.dev access attempt blocked:", {
      host,
      url: request.url,
    });
    return new Response("Forbidden: Direct access not allowed", {
      status: 403,
    });
  }

  // Check for CF-Ray header (indicates request went through Cloudflare)
  const cfRay = request.headers.get("cf-ray");
  if (!cfRay) {
    console.warn("Request missing CF-Ray header:", {
      host,
      url: request.url,
    });
    return new Response("Forbidden: Missing required headers", { status: 403 });
  }

  // Verify shared secret
  const secret = process.env.CLOUDFLARE_SECRET;
  if (!secret) {
    console.error("CLOUDFLARE_SECRET environment variable not set!");
    return new Response("Internal Server Error", { status: 500 });
  }

  const requestSecret = request.headers.get("x-cloudflare-secret");
  if (requestSecret !== secret) {
    console.warn("Invalid Cloudflare secret:", {
      host,
      url: request.url,
    });
    return new Response("Forbidden: Invalid credentials", { status: 403 });
  }

  // All checks passed
  return null;
}
