import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-session-secret";
process.env.CLOUDFLARE_SECRET = "test-cloudflare-secret";

// Mock Remix modules
vi.mock("@remix-run/react", async () => {
  const actual = await vi.importActual("@remix-run/react");
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useActionData: vi.fn(),
    useNavigation: vi.fn(() => ({ state: "idle" })),
    useSubmit: vi.fn(),
    Form: vi.fn(({ children, ...props }) => {
      return <form {...props}>{children}</form>;
    }),
    Link: vi.fn(({ children, to, ...props }) => {
      return (
        <a href={to} {...props}>
          {children}
        </a>
      );
    }),
  };
});
