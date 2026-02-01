import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { enforceCloudflareOnly } from "./security.server";

describe("Cloudflare Security: enforceCloudflareOnly", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Set default environment for tests
    process.env.NODE_ENV = "production";
    process.env.CLOUDFLARE_SECRET = "test-secret";
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original environment and mocks
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("returns null in development mode", () => {
    process.env.NODE_ENV = "development";
    const request = new Request("http://localhost");
    expect(enforceCloudflareOnly(request)).toBeNull();
  });

  it("returns null if DISABLE_CLOUDFLARE_CHECK is true", () => {
    process.env.DISABLE_CLOUDFLARE_CHECK = "true";
    const request = new Request("http://some-domain.com");
    expect(enforceCloudflareOnly(request)).toBeNull();
  });

  it("blocks direct access to fly.dev hostname", () => {
    const request = new Request("http://my-app.fly.dev", {
      headers: { Host: "my-app.fly.dev" },
    });
    const response = enforceCloudflareOnly(request);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);
    expect(console.warn).toHaveBeenCalledWith(
      "Direct fly.dev access attempt blocked:",
      expect.any(Object)
    );
  });

  it("blocks requests missing the cf-ray header", () => {
    const request = new Request("http://my-app.com");
    const response = enforceCloudflareOnly(request);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);
    expect(console.warn).toHaveBeenCalledWith(
      "Request missing CF-Ray header:",
      expect.any(Object)
    );
  });

  it("returns a 500 error if CLOUDFLARE_SECRET is not set in production", () => {
    delete process.env.CLOUDFLARE_SECRET;
    const request = new Request("http://my-app.com", {
      headers: { "cf-ray": "test-ray" },
    });
    const response = enforceCloudflareOnly(request);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(500);
    expect(console.error).toHaveBeenCalledWith(
      "CLOUDFLARE_SECRET environment variable not set!"
    );
  });

  it("blocks requests with an invalid x-cloudflare-secret header", () => {
    const request = new Request("http://my-app.com", {
      headers: {
        "cf-ray": "test-ray",
        "x-cloudflare-secret": "wrong-secret",
      },
    });
    const response = enforceCloudflareOnly(request);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);
    expect(console.warn).toHaveBeenCalledWith(
      "Invalid Cloudflare secret:",
      expect.any(Object)
    );
  });

  it("allows a valid request with all correct headers", () => {
    const request = new Request("http://my-app.com", {
      headers: {
        "cf-ray": "test-ray",
        "x-cloudflare-secret": "test-secret",
      },
    });
    const response = enforceCloudflareOnly(request);
    expect(response).toBeNull();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("blocks a request with a valid secret but on a fly.dev host", () => {
    const request = new Request("http://my-app.fly.dev", {
      headers: {
        Host: "my-app.fly.dev",
        "cf-ray": "test-ray",
        "x-cloudflare-secret": "test-secret",
      },
    });
    const response = enforceCloudflareOnly(request);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);
    expect(console.warn).toHaveBeenCalledWith(
      "Direct fly.dev access attempt blocked:",
      expect.any(Object)
    );
  });
});
