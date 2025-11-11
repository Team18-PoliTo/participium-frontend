import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import UserCard from "../UserCard";

// Mock callback
const mockOnAssignRole = vi.fn();

// Mock user data
const mockUnassignedUser = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  role: "Unassigned",
};

const mockAssignedUser = {
  id: 2,
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  role: "Project Manager",
};

// Mock available roles
const mockAvailableRoles = [
  { id: 0, role: "Unassigned" },
  { id: 2, role: "Project Manager" },
  { id: 3, role: "Technician" },
  { id: 4, role: "Administrator" },
];

// Helper function to render the UserCard component
const renderUserCard = (props = {}) => {
  const defaultProps = {
    user: mockUnassignedUser,
    onAssignRole: mockOnAssignRole,
    availableRoles: mockAvailableRoles,
  };

  return render(<UserCard {...defaultProps} {...props} />);
};

describe("UserCard component", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    mockOnAssignRole.mockReset();
    vi.clearAllMocks();
  });

  // Cleanup rendered components and restore timers after each test
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // Test: Verify user information is displayed
  it("displays user information correctly", () => {
    renderUserCard();

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  // Test: Verify user card shows name label
  it("displays name label", () => {
    renderUserCard();
    expect(screen.getByText("name:")).toBeInTheDocument();
  });

  // Test: Verify user card shows surname label
  it("displays surname label", () => {
    renderUserCard();
    expect(screen.getByText("surname:")).toBeInTheDocument();
  });

  // Test: Verify user card shows email label
  it("displays email label", () => {
    renderUserCard();
    expect(screen.getByText("email:")).toBeInTheDocument();
  });

  // Test: Verify add button is shown for unassigned users
  it("shows add button for unassigned user", () => {
    renderUserCard();

    const addButton = screen.getByRole("button");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveClass("user-add-btn");
  });

  // Test: Verify add button is not shown for assigned users
  it("does not show add button for assigned user", () => {
    renderUserCard({ user: mockAssignedUser });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // Test: Verify clicking add button opens RoleAssignmentModal
  it("opens RoleAssignmentModal when add button is clicked", async () => {
    const user = userEvent.setup();
    renderUserCard();

    const addButton = screen.getByRole("button");
    await user.click(addButton);

    // Verify modal is opened by checking for modal title
    expect(screen.getByText("Assign Role")).toBeInTheDocument();
  });

  // Test: Verify RoleAssignmentModal is not shown initially
  it("does not show RoleAssignmentModal initially", () => {
    renderUserCard();

    expect(screen.queryByText("Assign Role")).not.toBeInTheDocument();
  });

  // Test: Verify RoleAssignmentModal can be closed
  it("closes RoleAssignmentModal when close button is clicked", async () => {
    const user = userEvent.setup();
    renderUserCard();

    // Open modal
    const addButton = screen.getByRole("button");
    await user.click(addButton);

    expect(screen.getByText("Assign Role")).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByRole("button", { name: /×/i });
    await user.click(closeButton);

    // Verify modal is closed
    expect(screen.queryByText("Assign Role")).not.toBeInTheDocument();
  });

  // Test: Verify assigning role through modal calls onAssignRole
  it("calls onAssignRole when role is selected in modal", async () => {
    const user = userEvent.setup();
    renderUserCard();

    // Open modal
    const addButton = screen.getByRole("button");
    await user.click(addButton);

    // Select a role
    const projectManagerOption = screen.getByText("Project Manager");
    await user.click(projectManagerOption);

    // Verify callback was called
    expect(mockOnAssignRole).toHaveBeenCalledTimes(1);
    expect(mockOnAssignRole).toHaveBeenCalledWith(mockUnassignedUser.id, 2);
  });

  // Test: Verify modal closes after role assignment
  it("closes modal after role is assigned", async () => {
    const user = userEvent.setup();
    renderUserCard();

    // Open modal
    const addButton = screen.getByRole("button");
    await user.click(addButton);

    expect(screen.getByText("Assign Role")).toBeInTheDocument();

    // Select a role
    const projectManagerOption = screen.getByText("Project Manager");
    await user.click(projectManagerOption);

    // Verify modal is closed
    expect(screen.queryByText("Assign Role")).not.toBeInTheDocument();
  });

  // Test: Verify user icon is displayed
  it("displays user icon based on role", () => {
    const { container } = renderUserCard();

    const icon = container.querySelector(".user-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("alt", "Unassigned");
  });

  // Test: Verify correct icon for assigned user
  it("displays correct icon for assigned user", () => {
    const { container } = renderUserCard({ user: mockAssignedUser });

    const icon = container.querySelector(".user-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("alt", "Project Manager");
  });

  // Test: Verify user card has correct CSS class
  it("renders with correct CSS classes", () => {
    const { container } = renderUserCard();

    expect(container.querySelector(".user-card")).toBeInTheDocument();
    expect(container.querySelector(".user-info")).toBeInTheDocument();
    expect(container.querySelector(".user-icon")).toBeInTheDocument();
  });

  // Test: Verify add button has plus icon
  it("add button contains plus icon", () => {
    const { container } = renderUserCard();

    const plusIcon = container.querySelector(".plus-icon");
    expect(plusIcon).toBeInTheDocument();
  });

  // Test: Verify user card displays different user data correctly
  it("displays correct information for different user", () => {
    const differentUser = {
      id: 3,
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      role: "Technician",
    };

    renderUserCard({ user: differentUser });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Johnson")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  // Test: Verify info labels have correct CSS class
  it("info labels have correct CSS class", () => {
    const { container } = renderUserCard();

    const labels = container.querySelectorAll(".info-label");
    expect(labels.length).toBe(3);
  });

  // Test: Verify RoleAssignmentModal receives correct props
  it("passes correct props to RoleAssignmentModal", async () => {
    const user = userEvent.setup();
    renderUserCard();

    // Open modal
    const addButton = screen.getByRole("button");
    await user.click(addButton);

    // Verify modal shows correct user name
    expect(screen.getByText(/Select a role for John Doe/i)).toBeInTheDocument();
  });

  // Test: Verify user card handles undefined availableRoles
  it("handles undefined availableRoles gracefully", () => {
    renderUserCard({ availableRoles: undefined });

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  // Test: Verify user card handles empty availableRoles array
  it("handles empty availableRoles array", () => {
    renderUserCard({ availableRoles: [] });

    expect(screen.getByText("John")).toBeInTheDocument();
    // With empty roles, currentRoleObj will be undefined, so the button won't show
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // Test: Verify isUnassigned detection works correctly
  it("correctly identifies unassigned user with roleId 0", () => {
    renderUserCard();

    // Unassigned user should have add button
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  // Test: Verify assigned user with roleId > 0 is detected correctly
  it("correctly identifies assigned user", () => {
    renderUserCard({ user: mockAssignedUser });

    // Assigned user should not have add button
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // Test: Verify fallback icon is used when roleId not in iconMap
  it("uses fallback icon when roleId is not in iconMap", () => {
    const userWithUnknownRole = {
      id: 4,
      firstName: "Unknown",
      lastName: "User",
      email: "unknown@example.com",
      role: "CustomRole",
    };

    const { container } = renderUserCard({
      user: userWithUnknownRole,
      availableRoles: [{ id: 99, role: "CustomRole" }],
    });

    const icon = container.querySelector(".user-icon");
    expect(icon).toBeInTheDocument();
  });

  // Test: Verify multiple user cards can be rendered
  it("can render multiple user cards independently", () => {
    const { container: container1 } = render(
      <UserCard
        user={mockUnassignedUser}
        onAssignRole={mockOnAssignRole}
        availableRoles={mockAvailableRoles}
      />
    );

    const { container: container2 } = render(
      <UserCard
        user={mockAssignedUser}
        onAssignRole={mockOnAssignRole}
        availableRoles={mockAvailableRoles}
      />
    );

    expect(container1.querySelector(".user-card")).toBeInTheDocument();
    expect(container2.querySelector(".user-card")).toBeInTheDocument();

    cleanup();
  });

  // Test: Verify role assignment with different roles
  it("calls onAssignRole with correct roleId for Technician", async () => {
    const user = userEvent.setup();
    renderUserCard();

    // Open modal
    await user.click(screen.getByRole("button"));

    // Select Technician role
    await user.click(screen.getByText("Technician"));

    expect(mockOnAssignRole).toHaveBeenCalledWith(mockUnassignedUser.id, 3);
  });

  // Test: Verify role assignment with Administrator role
  it("calls onAssignRole with correct roleId for Administrator", async () => {
    const user = userEvent.setup();
    renderUserCard();

    // Open modal
    await user.click(screen.getByRole("button"));

    // Select Administrator role
    await user.click(screen.getByText("Administrator"));

    expect(mockOnAssignRole).toHaveBeenCalledWith(mockUnassignedUser.id, 4);
  });

  // Test: Verify modal overlay closes modal
  it("closes modal when clicking overlay", async () => {
    const user = userEvent.setup();
    const { container } = renderUserCard();

    // Open modal
    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Assign Role")).toBeInTheDocument();

    // Click overlay
    const overlay = container.querySelector(".role-modal-overlay");
    await user.click(overlay);

    // Verify modal is closed
    expect(screen.queryByText("Assign Role")).not.toBeInTheDocument();
  });
});
