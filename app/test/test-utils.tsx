import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Mock user types for different test scenarios
export const mockUsers = {
  unauthenticated: null,

  standard: {
    id: "user-1",
    email: "user@example.com",
    username: "testuser",
    isAdmin: false,
    passwordMustBeChanged: false,
    lockedAt: null,
  },

  standardWithLockedPicks: {
    id: "user-2",
    email: "locked@example.com",
    username: "lockeduser",
    isAdmin: false,
    passwordMustBeChanged: false,
    lockedAt: new Date("2024-03-10T00:00:00Z"),
  },

  admin: {
    id: "admin-1",
    email: "admin@example.com",
    username: "admin",
    isAdmin: true,
    passwordMustBeChanged: false,
    lockedAt: null,
  },

  passwordChangeRequired: {
    id: "user-3",
    email: "mustchange@example.com",
    username: "mustchange",
    isAdmin: false,
    passwordMustBeChanged: true,
    lockedAt: null,
  },
};

// Mock picks for testing
export const mockPicks = [
  {
    id: "pick-1",
    userId: "user-1",
    categoryKey: "best-picture",
    nominee: "Oppenheimer",
    betAmount: "100.00",
    lockedAt: null,
  },
  {
    id: "pick-2",
    userId: "user-1",
    categoryKey: "best-actor",
    nominee: "Cillian Murphy",
    betAmount: "50.00",
    lockedAt: null,
  },
];

export const mockLockedPicks = mockPicks.map((pick) => ({
  ...pick,
  lockedAt: new Date("2024-03-10T00:00:00Z"),
}));

// Mock categories and nominees
export const mockCategories = [
  {
    key: "best-picture",
    title: "Best Picture",
    nominees: [
      { name: "Oppenheimer", odds: -150 },
      { name: "Poor Things", odds: 200 },
      { name: "Killers of the Flower Moon", odds: 300 },
    ],
  },
  {
    key: "best-actor",
    title: "Best Actor",
    nominees: [
      { name: "Cillian Murphy", odds: -200 },
      { name: "Paul Giamatti", odds: 250 },
      { name: "Bradley Cooper", odds: 400 },
    ],
  },
];

// Mock loader data for different pages
export const mockLoaderData = {
  index: {
    user: mockUsers.standard,
    keyDates: {
      nominationsDate: "March 1, 2024",
      ceremonyDate: "March 10, 2024",
      lockDate: "March 9, 2024",
    },
    topNominations: [
      { title: "Oppenheimer", count: 13 },
      { title: "Poor Things", count: 11 },
    ],
  },

  ballot: {
    user: mockUsers.standard,
    categories: mockCategories,
    picks: mockPicks,
    totalBudget: 1000,
    remainingBudget: 850,
  },

  portfolio: {
    user: mockUsers.standard,
    picks: mockLockedPicks,
    totalBetAmount: "150.00",
    potentialPayout: "250.00",
  },

  leaderboard: {
    user: mockUsers.standard,
    rankings: [
      {
        rank: 1,
        username: "user1",
        totalWinnings: "500.00",
        correctPicks: 15,
      },
      {
        rank: 2,
        username: "testuser",
        totalWinnings: "350.00",
        correctPicks: 12,
      },
    ],
  },

  admin: {
    user: mockUsers.admin,
    stats: {
      totalUsers: 50,
      totalPicks: 750,
      totalBetAmount: "75000.00",
    },
  },

  adminUsers: {
    user: mockUsers.admin,
    users: [
      mockUsers.standard,
      mockUsers.standardWithLockedPicks,
      mockUsers.passwordChangeRequired,
    ],
  },
};

// Mock action data for form submissions
export const mockActionData = {
  success: {
    success: true,
    message: "Operation completed successfully",
  },

  error: {
    error: "An error occurred",
    fields: {},
  },

  validationError: {
    error: "Validation failed",
    fields: {
      email: "Invalid email address",
      password: "Password is required",
    },
  },

  pickSubmission: {
    success: true,
    pick: mockPicks[0],
    remainingBudget: 900,
  },
};

// Custom render function that includes common providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { ...options });
}

// Helper to create mock FormData
export function createMockFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

// Helper to create mock Request
export function createMockRequest(
  url: string,
  options?: {
    method?: string;
    body?: FormData;
    headers?: Record<string, string>;
  }
): Request {
  return new Request(url, {
    method: options?.method || "GET",
    body: options?.body,
    headers: options?.headers,
  });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
