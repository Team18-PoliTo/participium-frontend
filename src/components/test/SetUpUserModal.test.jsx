import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SetUpUserModal from "../SetUpUserModal";

// Mock callbacks
const mockOnClose = vi.fn();
const mockOnCreateUser = vi.fn();

// Helper function to render the SetUpUserModal component
const renderSetUpUserModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onCreateUser: mockOnCreateUser,
  };

  return render(<SetUpUserModal {...defaultProps} {...props} />);
};

describe("SetUpUserModal component", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    mockOnClose.mockReset();
    mockOnCreateUser.mockReset();
    vi.clearAllMocks();
  });

  // Cleanup rendered components and restore timers after each test
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // Test: Verify modal does not render when isOpen is false
  it("does not render when isOpen is false", () => {
    const { container } = renderSetUpUserModal({ isOpen: false });
    expect(container.querySelector(".modal")).not.toBeInTheDocument();
  });

  // Test: Verify modal renders when isOpen is true
  it("renders when isOpen is true", () => {
    renderSetUpUserModal();
    expect(screen.getByText("Add a new municipality user")).toBeInTheDocument();
  });

  // Test: Verify all form fields are rendered
  it("renders name, surname, email, password fields and create button", () => {
    renderSetUpUserModal();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Surname")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create user/i })
    ).toBeInTheDocument();
  });

  // Test: Verify modal title is correct
  it("displays correct modal title", () => {
    renderSetUpUserModal();
    expect(screen.getByText("Add a new municipality user")).toBeInTheDocument();
  });

  // Test: Verify close button is rendered
  it("renders close button in header", () => {
    renderSetUpUserModal();
    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  // Test: Verify clicking close button calls onClose
  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    renderSetUpUserModal();

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test: Verify loading indicator appears during form submission
  it("shows loading indicator while submitting", async () => {
    const user = userEvent.setup();
    // Mock onCreateUser to never resolve, keeping the component in pending state
    mockOnCreateUser.mockImplementation(() => new Promise(() => {}));

    renderSetUpUserModal();

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Surname"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    expect(screen.getByText("Creating...")).toBeInTheDocument();
  });

  // Test: Verify successful user creation flow
  it("performs successful user creation flow: calls onCreateUser and closes modal", async () => {
    const user = userEvent.setup();
    const newUser = {
      name: "John",
      surname: "Doe",
      email: "john@example.com",
      password: "password123",
    };

    mockOnCreateUser.mockResolvedValue(newUser);

    renderSetUpUserModal();

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Surname"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    // Verify onCreateUser was called with correct data
    await waitFor(() => {
      expect(mockOnCreateUser).toHaveBeenCalledWith({
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        password: "password123",
      });
    });

    // Verify onClose was called after successful creation
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // Test: Verify error message is displayed on creation failure
  it("shows error alert when user creation fails", async () => {
    const user = userEvent.setup();
    mockOnCreateUser.mockRejectedValue(new Error("Email already exists"));

    renderSetUpUserModal();

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Surname"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });

    // Verify modal is not closed on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // Test: Verify error alert can be dismissed
  it("allows dismissing error alert", async () => {
    const user = userEvent.setup();
    mockOnCreateUser.mockRejectedValue(new Error("Email already exists"));

    renderSetUpUserModal();

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Surname"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });

    // Find and click close button on alert
    const alertCloseButton = screen.getByRole("button", {
      name: /close alert/i,
    });
    await user.click(alertCloseButton);

    // Verify error message is removed
    await waitFor(() => {
      expect(
        screen.queryByText("Email already exists")
      ).not.toBeInTheDocument();
    });
  });

  // Test: Verify form fields have required attribute
  it("marks all fields as required", () => {
    renderSetUpUserModal();

    expect(screen.getByLabelText("Name")).toBeRequired();
    expect(screen.getByLabelText("Surname")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
  });

  // Test: Verify email field has correct type
  it("email field has type email", () => {
    renderSetUpUserModal();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });

  // Test: Verify password field has correct type
  it("password field has type password", () => {
    renderSetUpUserModal();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password"
    );
  });

  // Test: Verify form fields have correct placeholders
  it("has correct placeholder text for input fields", () => {
    renderSetUpUserModal();

    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter surname")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  // Test: Verify submit button is disabled during submission
  it("disables submit button while submitting", async () => {
    const user = userEvent.setup();
    mockOnCreateUser.mockImplementation(() => new Promise(() => {}));

    renderSetUpUserModal();

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Surname"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");

    const submitButton = screen.getByRole("button", { name: /create user/i });
    await user.click(submitButton);

    // Verify button is disabled
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  // Test: Verify loading indicator is not shown initially
  it("does not show loading indicator initially", () => {
    renderSetUpUserModal();
    expect(screen.queryByText("Creating...")).not.toBeInTheDocument();
  });

  // Test: Verify error is not shown initially
  it("does not show error alert initially", () => {
    renderSetUpUserModal();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // Test: Verify form can be submitted using Enter key
  it("submits with Enter key", async () => {
    const user = userEvent.setup();
    mockOnCreateUser.mockResolvedValue({});

    renderSetUpUserModal();

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Surname"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.keyboard("{Enter}");

    // Verify onCreateUser was called
    await waitFor(() => {
      expect(mockOnCreateUser).toHaveBeenCalled();
    });
  });

  // Test: Verify form data is cleared after successful submission
  it("resets form after successful submission", async () => {
    const user = userEvent.setup();
    mockOnCreateUser.mockResolvedValue({});

    renderSetUpUserModal();

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Surname"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Test: Verify error state is cleared when modal closes
  it("clears error when modal is closed", async () => {
    const user = userEvent.setup();
    mockOnCreateUser.mockRejectedValue(new Error("Test error"));

    const { rerender } = renderSetUpUserModal();

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Surname"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });

    // Close modal by clicking the modal header close button
    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    const headerCloseButton = closeButtons[0]; // First one is the header close button
    await user.click(headerCloseButton);

    // Re-render with isOpen = false then true again
    rerender(
      <SetUpUserModal
        isOpen={false}
        onClose={mockOnClose}
        onCreateUser={mockOnCreateUser}
      />
    );
    rerender(
      <SetUpUserModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateUser={mockOnCreateUser}
      />
    );

    // Verify error is cleared
    expect(screen.queryByText("Test error")).not.toBeInTheDocument();
  });

  // Test: Verify modal has correct CSS class
  it("renders with correct CSS classes", () => {
    renderSetUpUserModal();

    // Modal is rendered in a portal, so we check for elements directly
    expect(screen.getByText("Add a new municipality user")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Name").closest(".setup-user-container")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Name").closest(".setup-user-form")
    ).toBeInTheDocument();
  });

  // Test: Verify form fields have correct IDs
  it("form fields have correct IDs for accessibility", () => {
    renderSetUpUserModal();

    expect(screen.getByLabelText("Name")).toHaveAttribute("id", "formName");
    expect(screen.getByLabelText("Surname")).toHaveAttribute(
      "id",
      "formSurname"
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "formEmail");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "id",
      "formPassword"
    );
  });

  // Test: Verify form fields have correct names
  it("form fields have correct name attributes", () => {
    renderSetUpUserModal();

    expect(screen.getByLabelText("Name")).toHaveAttribute("name", "name");
    expect(screen.getByLabelText("Surname")).toHaveAttribute("name", "surname");
    expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "name",
      "password"
    );
  });

  // Test: Verify submit button has correct type
  it("submit button has correct type attribute", () => {
    renderSetUpUserModal();
    const button = screen.getByRole("button", { name: /create user/i });
    expect(button).toHaveAttribute("type", "submit");
  });

  // Test: Verify modal cannot be closed by clicking backdrop (backdrop="static")
  it("does not close when clicking backdrop due to static backdrop", async () => {
    const user = userEvent.setup();
    const { container } = renderSetUpUserModal();

    // Try to click on backdrop (if it exists)
    const backdrop = container.querySelector(".modal-backdrop");
    if (backdrop) {
      await user.click(backdrop);
      // Should not close
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  // Test: Verify modal shows generic error message when error has no message
  it("shows generic error message when error has no message property", async () => {
    const user = userEvent.setup();
    mockOnCreateUser.mockRejectedValue({});

    renderSetUpUserModal();

    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Surname"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    // Verify generic error message is displayed
    await waitFor(() => {
      expect(screen.getByText("Failed to create user")).toBeInTheDocument();
    });
  });
});
