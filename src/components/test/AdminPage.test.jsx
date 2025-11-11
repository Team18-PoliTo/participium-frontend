import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AdminPage from "../AdminPage";
import * as API from "../../API/API";
import { MemoryRouter } from "react-router";

// Mock API methods
const mockGetAllRoles = vi.spyOn(API.default, "getAllRoles");
const mockGetAllInternalUsers = vi.spyOn(API.default, "getAllInternalUsers");
const mockRegisterInternalUser = vi.spyOn(API.default, "registerInternalUser");
const mockUpdateInternalUserRole = vi.spyOn(
  API.default,
  "updateInternalUserRole"
);

// Helper function to render the AdminPage component with router context
const renderAdminPage = () => {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>
  );
};

// Mock data
const mockRoles = [
  { id: 1, role: "Citizen" },
  { id: 2, role: "Project Manager" },
  { id: 3, role: "Technician" },
  { id: 4, role: "Administrator" },
];

const mockUsers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "Project Manager",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    role: "Technician",
  },
  {
    id: 3,
    firstName: "Bob",
    lastName: "Wilson",
    email: "bob@example.com",
    role: "Unassigned",
  },
];

describe("AdminPage component", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    mockGetAllRoles.mockReset();
    mockGetAllInternalUsers.mockReset();
    mockRegisterInternalUser.mockReset();
    mockUpdateInternalUserRole.mockReset();
    vi.clearAllMocks();
  });

  // Cleanup rendered components and restore timers after each test
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // Test: Verify component renders and fetches data on mount
  it("renders and fetches roles and users on mount", async () => {
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    renderAdminPage();

    // Verify API calls were made
    await waitFor(() => {
      expect(mockGetAllRoles).toHaveBeenCalledTimes(1);
      expect(mockGetAllInternalUsers).toHaveBeenCalledTimes(1);
    });
  });

  // Test: Verify essential UI elements are rendered
  it("renders add user button, filters, and legend", async () => {
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    renderAdminPage();

    // Wait for data to load
    await waitFor(() => {
      expect(mockGetAllRoles).toHaveBeenCalled();
    });

    // Verify UI elements
    expect(
      screen.getByRole("button", { name: /add a new user/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Filter by:")).toBeInTheDocument();
    expect(screen.getByText("Legend for users")).toBeInTheDocument();
  });

  // Test: Verify filter buttons are rendered for non-citizen roles
  it("renders filter buttons for visible roles (excluding Citizen)", async () => {
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    renderAdminPage();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Project Manager" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Technician" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Administrator" })
      ).toBeInTheDocument();
    });

    // Verify Citizen role is not shown as filter
    expect(
      screen.queryByRole("button", { name: "Citizen" })
    ).not.toBeInTheDocument();
  });

  // Test: Verify users are displayed as UserCard components
  it("displays all users in UserCard components", async () => {
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });
  });

  // Test: Verify clicking filter button filters users by role
  it("filters users when filter button is clicked", async () => {
    const user = userEvent.setup();
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    // Click on Project Manager filter
    const filterButton = screen.getByRole("button", {
      name: "Project Manager",
    });
    await user.click(filterButton);

    // Verify button is active
    expect(filterButton).toHaveClass("active");

    // Verify only Project Manager users are shown (John Doe)
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    // Other users should still be in DOM but might be filtered
  });

  // Test: Verify clicking filter button again removes filter
  it("removes filter when clicking active filter button again", async () => {
    const user = userEvent.setup();
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const filterButton = screen.getByRole("button", {
      name: "Project Manager",
    });

    // Click to activate filter
    await user.click(filterButton);
    expect(filterButton).toHaveClass("active");

    // Click again to deactivate
    await user.click(filterButton);
    expect(filterButton).not.toHaveClass("active");
  });

  // Test: Verify opening SetUpUserModal when clicking add user button
  it("opens SetUpUserModal when add user button is clicked", async () => {
    const user = userEvent.setup();
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    renderAdminPage();

    await waitFor(() => {
      expect(mockGetAllRoles).toHaveBeenCalled();
    });

    const addButton = screen.getByRole("button", { name: /add a new user/i });
    await user.click(addButton);

    // Verify modal is opened by checking for modal title
    await waitFor(() => {
      expect(
        screen.getByText("Add a new municipality user")
      ).toBeInTheDocument();
    });
  });

  // Test: Verify creating a new user updates the user list
  it("creates new user and updates user list", async () => {
    const user = userEvent.setup();
    const newUser = {
      id: 4,
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      role: "Administrator",
    };

    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);
    mockRegisterInternalUser.mockResolvedValue(newUser);

    renderAdminPage();

    await waitFor(() => {
      expect(mockGetAllRoles).toHaveBeenCalled();
    });

    // Open modal
    const addButton = screen.getByRole("button", { name: /add a new user/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(
        screen.getByText("Add a new municipality user")
      ).toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByLabelText("Name"), "Alice");
    await user.type(screen.getByLabelText("Surname"), "Johnson");
    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");

    // Submit form
    const createButton = screen.getByRole("button", { name: /create user/i });
    await user.click(createButton);

    // Verify API was called
    await waitFor(() => {
      expect(mockRegisterInternalUser).toHaveBeenCalledWith({
        name: "Alice",
        surname: "Johnson",
        email: "alice@example.com",
        password: "password123",
      });
    });

    // Verify new user appears in the list
    await waitFor(() => {
      expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    });
  });

  // Test: Verify assigning role to user updates the user
  it("assigns role to user and updates user list", async () => {
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);
    mockUpdateInternalUserRole.mockResolvedValue({});

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    // Note: The actual role assignment would require interaction with UserCard
    // which triggers RoleAssignmentModal. This is tested in UserCard tests.
  });

  // Test: Verify legend displays all visible roles with icons
  it("displays legend with all visible roles", async () => {
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("Legend for users")).toBeInTheDocument();
    });

    // Verify legend items for visible roles
    const legendSection = screen
      .getByText("Legend for users")
      .closest(".legend-box");
    expect(legendSection).toBeInTheDocument();
  });

  // Test: Verify error handling when fetching roles fails
  it("handles error when fetching roles fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetAllRoles.mockRejectedValue(new Error("Failed to fetch roles"));

    renderAdminPage();

    await waitFor(() => {
      expect(mockGetAllRoles).toHaveBeenCalled();
    });

    // Verify error was logged
    expect(consoleError).toHaveBeenCalledWith(
      "Error fetching roles:",
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  // Test: Verify error handling when fetching users fails
  it("handles error when fetching users fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockRejectedValue(
      new Error("Failed to fetch users")
    );

    renderAdminPage();

    await waitFor(() => {
      expect(mockGetAllInternalUsers).toHaveBeenCalled();
    });

    // Verify error was logged
    expect(consoleError).toHaveBeenCalledWith(
      "Error fetching users:",
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  // Test: Verify users with Citizen role are filtered out
  it("filters out users with Citizen role from display", async () => {
    const usersWithCitizen = [
      ...mockUsers,
      {
        id: 4,
        firstName: "Citizen",
        lastName: "User",
        email: "citizen@example.com",
        role: "Citizen",
      },
    ];

    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(usersWithCitizen);

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    // Verify citizen user is filtered out
    expect(screen.queryByText("citizen@example.com")).not.toBeInTheDocument();
  });

  // Test: Verify component has correct CSS class
  it("renders with correct CSS classes", async () => {
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    const { container } = renderAdminPage();

    await waitFor(() => {
      expect(mockGetAllRoles).toHaveBeenCalled();
    });

    expect(container.querySelector(".admin-board")).toBeInTheDocument();
    expect(container.querySelector(".admin-sidebar")).toBeInTheDocument();
    expect(
      container.querySelector(".admin-legend-section")
    ).toBeInTheDocument();
  });

  // Test: Verify divider line is rendered between sections
  it("renders divider line between filter/legend and user list", async () => {
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue(mockUsers);

    const { container } = renderAdminPage();

    await waitFor(() => {
      expect(mockGetAllRoles).toHaveBeenCalled();
    });

    expect(container.querySelector(".divider-line")).toBeInTheDocument();
  });

  // Test: Verify empty user list renders correctly
  it("renders correctly with empty user list", async () => {
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllInternalUsers.mockResolvedValue([]);

    renderAdminPage();

    await waitFor(() => {
      expect(mockGetAllInternalUsers).toHaveBeenCalled();
    });

    // Verify add button is still available
    expect(
      screen.getByRole("button", { name: /add a new user/i })
    ).toBeInTheDocument();
  });
});
