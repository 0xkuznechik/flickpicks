import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isCloudflareRequest,
  isCloudflareIp,
  enforceCloudflareOnly,
} from "./security.server";

describe("Cloudflare Security", () => {
  describe("isCloudflareRequest", () => {
    it("returns true when CF-Connecting-IP header is present", () => {
      const request = new Request("http://localhost", {
        headers: { "CF-Connecting-IP": "1.2.3.4" },
      });
      expect(isCloudflareRequest(request)).toBe(true);
    });

    it("returns true when CF-Ray header is present", () => {
      const request = new Request("http://localhost", {
        headers: { "CF-Ray": "7d1f2a3b4c5d6e7f-SJC" },
      });
      expect(isCloudflareRequest(request)).toBe(true);
    });

    it("returns true when CF-Visitor header is present", () => {
      const request = new Request("http://localhost", {
        headers: { "CF-Visitor": '{"scheme":"https"}' },
      });
      expect(isCloudflareRequest(request)).toBe(true);
    });

    it("returns true when multiple CF headers are present", () => {
      const request = new Request("http://localhost", {
        headers: {
          "CF-Connecting-IP": "1.2.3.4",
          "CF-Ray": "7d1f2a3b4c5d6e7f-SJC",
          "CF-Visitor": '{"scheme":"https"}',
        },
      });
      expect(isCloudflareRequest(request)).toBe(true);
    });

    it("returns false when no CF headers are present", () => {
      const request = new Request("http://localhost");
      expect(isCloudflareRequest(request)).toBe(false);
    });

    it("returns false when only non-CF headers are present", () => {
      const request = new Request("http://localhost", {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "X-Forwarded-For": "1.2.3.4",
        },
      });
      expect(isCloudflareRequest(request)).toBe(false);
    });
  });

  describe("isCloudflareIp", () => {
    it("returns true for IPs in Cloudflare range 173.245.48.0/20", () => {
      expect(isCloudflareIp("173.245.48.1")).toBe(true);
      expect(isCloudflareIp("173.245.50.100")).toBe(true);
      expect(isCloudflareIp("173.245.63.255")).toBe(true);
    });

    it("returns true for IPs in Cloudflare range 103.21.244.0/22", () => {
      expect(isCloudflareIp("103.21.244.1")).toBe(true);
      expect(isCloudflareIp("103.21.245.100")).toBe(true);
    });

    it("returns true for IPs in Cloudflare range 104.16.0.0/13", () => {
      expect(isCloudflareIp("104.16.0.1")).toBe(true);
      expect(isCloudflareIp("104.20.50.100")).toBe(true);
    });

    it("returns false for non-Cloudflare IPs", () => {
      expect(isCloudflareIp("192.168.1.1")).toBe(false);
      expect(isCloudflareIp("10.0.0.1")).toBe(false);
      expect(isCloudflareIp("8.8.8.8")).toBe(false);
    });

    it("returns false for null or empty IP", () => {
      expect(isCloudflareIp(null)).toBe(false);
      expect(isCloudflareIp("")).toBe(false);
    });

    it("handles X-Forwarded-For with multiple IPs (comma-separated)", () => {
      // Should only check the first IP
      expect(isCloudflareIp("173.245.48.1, 192.168.1.1")).toBe(true);
      expect(isCloudflareIp("192.168.1.1, 173.245.48.1")).toBe(false);
    });

    it("handles IPs with whitespace", () => {
      expect(isCloudflareIp("  173.245.48.1  ")).toBe(true);
      expect(isCloudflareIp("173.245.48.1 , 192.168.1.1")).toBe(true);
    });

    it("returns false for invalid IP format", () => {
      expect(isCloudflareIp("invalid")).toBe(false);
      expect(isCloudflareIp("256.256.256.256")).toBe(false);
    });
  });

  describe("enforceCloudflareOnly", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      // Reset NODE_ENV before each test
      process.env.NODE_ENV = "production";
    });

    afterEach(() => {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });

    it("returns null in development mode", () => {
      process.env.NODE_ENV = "development";
      const request = new Request("http://localhost");
      expect(enforceCloudflareOnly(request)).toBeNull();
    });

    it("returns null when request has CF headers in production", () => {
      process.env.NODE_ENV = "production";
      const request = new Request("http://localhost", {
        headers: { "CF-Connecting-IP": "1.2.3.4" },
      });
      expect(enforceCloudflareOnly(request)).toBeNull();
    });

    it("returns 403 Response when no CF headers in production", () => {
      process.env.NODE_ENV = "production";
      const request = new Request("http://localhost");
      const response = enforceCloudflareOnly(request);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(403);
      expect(response?.headers.get("Content-Type")).toBe("text/plain");
    });

    it("includes descriptive error message in 403 response", async () => {
      process.env.NODE_ENV = "production";
      const request = new Request("http://localhost");
      const response = enforceCloudflareOnly(request);

      expect(response).not.toBeNull();
      const text = await response?.text();
      expect(text).toContain("Forbidden");
      expect(text).toContain("Cloudflare");
    });

    it("allows request with any CF header (CF-Ray)", () => {
      process.env.NODE_ENV = "production";
      const request = new Request("http://localhost", {
        headers: { "CF-Ray": "7d1f2a3b4c5d6e7f-SJC" },
      });
      expect(enforceCloudflareOnly(request)).toBeNull();
    });

    it("allows request with any CF header (CF-Visitor)", () => {
      process.env.NODE_ENV = "production";
      const request = new Request("http://localhost", {
        headers: { "CF-Visitor": '{"scheme":"https"}' },
      });
      expect(enforceCloudflareOnly(request)).toBeNull();
    });

    it("blocks request with only X-Forwarded-For (not a CF header)", () => {
      process.env.NODE_ENV = "production";
      const request = new Request("http://localhost", {
        headers: { "X-Forwarded-For": "1.2.3.4" },
      });
      const response = enforceCloudflareOnly(request);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(403);
    });

    it("logs warning when blocking direct access", () => {
      process.env.NODE_ENV = "production";
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const request = new Request("http://localhost/test-path", {
        headers: { "User-Agent": "TestBot/1.0" },
      });
      enforceCloudflareOnly(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Unauthorized direct access attempt detected:",
        expect.objectContaining({
          url: "http://localhost/test-path",
          userAgent: "TestBot/1.0",
        })
      );

      consoleSpy.mockRestore();
    });

    it("logs warning for suspicious CF headers with non-CF IP", () => {
      process.env.NODE_ENV = "production";
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const request = new Request("http://localhost", {
        headers: {
          "CF-Connecting-IP": "1.2.3.4",
          "X-Forwarded-For": "192.168.1.1", // Not a CF IP
        },
      });

      enforceCloudflareOnly(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Request has CF headers but IP is not from Cloudflare range:",
        expect.objectContaining({
          ip: "192.168.1.1",
        })
      );

      consoleSpy.mockRestore();
    });

    it("does not log warning for CF headers with valid CF IP", () => {
      process.env.NODE_ENV = "production";
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const request = new Request("http://localhost", {
        headers: {
          "CF-Connecting-IP": "1.2.3.4",
          "X-Forwarded-For": "173.245.48.1", // Valid CF IP
        },
      });

      enforceCloudflareOnly(request);

      // Should only be called once for successful validation (not for suspicious IP)
      expect(consoleSpy).not.toHaveBeenCalledWith(
        "Request has CF headers but IP is not from Cloudflare range:",
        expect.anything()
      );

      consoleSpy.mockRestore();
    });
  });
});
