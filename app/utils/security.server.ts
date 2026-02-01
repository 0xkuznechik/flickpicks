/**
 * Security utilities for validating requests
 */

/**
 * Cloudflare IP ranges (update periodically from https://www.cloudflare.com/ips/)
 * These are the IPv4 and IPv6 ranges that Cloudflare uses
 */
const CLOUDFLARE_IPV4_RANGES = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
];

/**
 * Check if a request came through Cloudflare by looking for CF headers
 */
export function isCloudflareRequest(request: Request): boolean {
  // Check for Cloudflare-specific headers
  const cfConnectingIp = request.headers.get("CF-Connecting-IP");
  const cfRay = request.headers.get("CF-Ray");
  const cfVisitor = request.headers.get("CF-Visitor");

  // If any of these headers are present, it's likely from Cloudflare
  return !!(cfConnectingIp || cfRay || cfVisitor);
}

/**
 * Parse an IP address and check if it's in a CIDR range
 */
function ipInRange(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split("/");
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);

  const ipNum =
    ip.split(".").reduce((num, octet) => (num << 8) | parseInt(octet), 0) >>> 0;
  const rangeNum =
    range.split(".").reduce((num, octet) => (num << 8) | parseInt(octet), 0) >>>
    0;

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Verify that the X-Forwarded-For IP is from Cloudflare's IP ranges
 * This is an additional security check beyond just checking for CF headers
 */
export function isCloudflareIp(ip: string | null): boolean {
  if (!ip) return false;

  // Handle X-Forwarded-For which can be a comma-separated list
  const firstIp = ip.split(",")[0].trim();

  // Check if IP is in any of Cloudflare's ranges
  return CLOUDFLARE_IPV4_RANGES.some((range) => {
    try {
      return ipInRange(firstIp, range);
    } catch {
      return false;
    }
  });
}

/**
 * Middleware function to enforce Cloudflare-only traffic
 * Returns null if request is valid, or a Response to return to the client
 */
export function enforceCloudflareOnly(request: Request): Response | null {
  // Skip enforcement in development
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  // Check for Cloudflare headers
  const hasCloudflareHeaders = isCloudflareRequest(request);

  if (!hasCloudflareHeaders) {
    console.warn("Unauthorized direct access attempt detected:", {
      url: request.url,
      userAgent: request.headers.get("User-Agent"),
      ip: request.headers.get("X-Forwarded-For"),
    });

    return new Response("Forbidden: This origin is protected by Cloudflare.", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Optional: Additional verification of Cloudflare IP ranges
  const forwardedFor = request.headers.get("X-Forwarded-For");
  if (forwardedFor && !isCloudflareIp(forwardedFor)) {
    console.warn(
      "Request has CF headers but IP is not from Cloudflare range:",
      {
        url: request.url,
        ip: forwardedFor,
      }
    );

    // Uncomment to enforce strict IP range checking:
    // return new Response("Forbidden: Invalid origin.", {
    //   status: 403,
    //   headers: { "Content-Type": "text/plain" },
    // });
  }

  return null; // Request is valid
}
