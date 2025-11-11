import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import RoleAssignmentModal from "../RoleAssignmentModal";

// Mock callbacks
const mockOnClose = vi.fn();
const mockOnAssignRole = vi.fn();

// Mock user data
const mockUser = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  role: "Unassigned",
};

// Mock available roles
const mockAvailableRoles = [
  { id: 1, role: "Citizen" },
  { id: 2, role: "Project Manager" },
  { id: 3, role: "Technician" },
  { id: 4, role: "Administrator" },
];

// Helper function to render the RoleAssignmentModal component
const renderRoleAssignmentModal = (props = {}) => {
  const defaultProps = {
    user: mockUser,
    isOpen: true,
    onClose: mockOnClose,
    onAssignRole: mockOnAssignRole,
    availableRoles: mockAvailableRoles,
  };

  return render(<RoleAssignmentModal {...defaultProps} {...props} />);
};

describe("RoleAssignmentModal component", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    mockOnClose.mockReset();
    mockOnAssignRole.mockReset();
    vi.clearAllMocks();
  });

  // Cleanup rendered components and restore timers after each test
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // Test: Verify modal does not render when isOpen is false
  it("does not render when isOpen is false", () => {
    const { container } = renderRoleAssignmentModal({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  // Test: Verify modal renders when isOpen is true
  it("renders when isOpen is true", () => {
    renderRoleAssignmentModal();
    expect(screen.getByText("Assign Role")).toBeInTheDocument();
  });

  // Test: Verify modal title is rendered
  it("renders modal title", () => {
    renderRoleAssignmentModal();
    expect(screen.getByText("Assign Role")).toBeInTheDocument();
  });

  // Test: Verify modal subtitle shows user name
  it("displays subtitle with user name", () => {
    renderRoleAssignmentModal();
    expect(screen.getByText(/Select a role for John Doe/i)).toBeInTheDocument();
  });

  // Test: Verify close button is rendered
  it("renders close button", () => {
    renderRoleAssignmentModal();
    expect(screen.getByRole("button", { name: /×/i })).toBeInTheDocument();
  });

  // Test: Verify clicking close button calls onClose
  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    renderRoleAssignmentModal();

    const closeButton = screen.getByRole("button", { name: /×/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test: Verify clicking overlay calls onClose
  it("calls onClose when clicking modal overlay", async () => {
    const user = userEvent.setup();
    const { container } = renderRoleAssignmentModal();

    const overlay = container.querySelector(".role-modal-overlay");
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test: Verify clicking modal content does not close modal
  it("does not close when clicking modal content", async () => {
    const user = userEvent.setup();
    const { container } = renderRoleAssignmentModal();

    const content = container.querySelector(".role-modal-content");
    await user.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // Test: Verify role options are rendered (excluding Citizen role)
  it("renders role options excluding Citizen role", () => {
    renderRoleAssignmentModal();

    // Verify visible roles
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getByText("Technician")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();

    // Verify Citizen role is not shown (filtered by id > 1)
    expect(screen.queryByText("Citizen")).not.toBeInTheDocument();
  });

  // Test: Verify clicking a role option calls onAssignRole and onClose
  it("calls onAssignRole and onClose when role is selected", async () => {
    const user = userEvent.setup();
    renderRoleAssignmentModal();

    const projectManagerOption = screen.getByText("Project Manager");
    await user.click(projectManagerOption);

    expect(mockOnAssignRole).toHaveBeenCalledTimes(1);
    expect(mockOnAssignRole).toHaveBeenCalledWith(mockUser.id, 2);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test: Verify clicking Technician role calls onAssignRole with correct roleId
  it("calls onAssignRole with correct roleId for Technician", async () => {
    const user = userEvent.setup();
    renderRoleAssignmentModal();

    const technicianOption = screen.getByText("Technician");
    await user.click(technicianOption);

    expect(mockOnAssignRole).toHaveBeenCalledWith(mockUser.id, 3);
  });

  // Test: Verify clicking Administrator role calls onAssignRole with correct roleId
  it("calls onAssignRole with correct roleId for Administrator", async () => {
    const user = userEvent.setup();
    renderRoleAssignmentModal();

    const adminOption = screen.getByText("Administrator");
    await user.click(adminOption);

    expect(mockOnAssignRole).toHaveBeenCalledWith(mockUser.id, 4);
  });

  // Test: Verify modal has correct CSS classes
  it("renders with correct CSS classes", () => {
    const { container } = renderRoleAssignmentModal();

    expect(container.querySelector(".role-modal-overlay")).toBeInTheDocument();
    expect(container.querySelector(".role-modal-content")).toBeInTheDocument();
    expect(container.querySelector(".role-modal-title")).toBeInTheDocument();
    expect(container.querySelector(".role-modal-subtitle")).toBeInTheDocument();
    expect(container.querySelector(".role-options")).toBeInTheDocument();
  });

  // Test: Verify role options have role-option class
  it("renders role options with correct CSS classes", () => {
    const { container } = renderRoleAssignmentModal();

    const roleOptions = container.querySelectorAll(".role-option");
    // Should have 3 options (excluding Citizen)
    expect(roleOptions.length).toBe(3);
  });

  // Test: Verify role icons are rendered
  it("renders role icons for each option", () => {
    const { container } = renderRoleAssignmentModal();

    const roleIcons = container.querySelectorAll(".role-icon");
    // Should have 3 icons (excluding Citizen)
    expect(roleIcons.length).toBe(3);
  });

  // Test: Verify modal handles undefined availableRoles gracefully
  it("handles undefined availableRoles gracefully", () => {
    renderRoleAssignmentModal({ availableRoles: undefined });

    // Should still render modal but with no role options
    expect(screen.getByText("Assign Role")).toBeInTheDocument();
  });

  // Test: Verify modal handles empty availableRoles array
  it("handles empty availableRoles array", () => {
    renderRoleAssignmentModal({ availableRoles: [] });

    expect(screen.getByText("Assign Role")).toBeInTheDocument();
    // No role options should be rendered
    expect(screen.queryByText("Project Manager")).not.toBeInTheDocument();
  });

  // Test: Verify modal displays correct user name in subtitle
  it("displays correct user name in subtitle for different users", () => {
    const differentUser = {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      role: "Unassigned",
    };

    renderRoleAssignmentModal({ user: differentUser });

    expect(
      screen.getByText(/Select a role for Jane Smith/i)
    ).toBeInTheDocument();
  });

  // Test: Verify close button has correct class
  it("close button has correct class", () => {
    const { container } = renderRoleAssignmentModal();

    expect(container.querySelector(".role-modal-close")).toBeInTheDocument();
  });

  // Test: Verify modal content has correct background color style
  it("modal content has correct background color", () => {
    const { container } = renderRoleAssignmentModal();

    const modalContent = container.querySelector(".role-modal-content");
    expect(modalContent).toHaveStyle({ backgroundColor: "#E1EDF4" });
  });

  // Test: Verify role options have correct background color style
  it("role options have correct background color", () => {
    const { container } = renderRoleAssignmentModal();

    const roleOptions = container.querySelectorAll(".role-option");
    roleOptions.forEach((option) => {
      expect(option).toHaveStyle({ backgroundColor: "#98C1D9" });
    });
  });

  // Test: Verify modal renders with all roles when filter allows
  it("renders correct number of role options based on filter", () => {
    const { container } = renderRoleAssignmentModal();

    const roleOptions = container.querySelectorAll(".role-option");
    // Should be 3 (Project Manager, Technician, Administrator)
    expect(roleOptions.length).toBe(3);
  });
});
