import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Registration from '../Registration';
import * as API from '../../API/API';
import { MemoryRouter, Route, Routes } from 'react-router';

// Mock the navigate function from react-router
const mockNavigate = vi.fn();

// Mock the react-router module to use our mocked navigate function
vi.mock('react-router', async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Spy on the registerCitizen API method to mock its behavior
const mockRegister = vi.spyOn(API.default, 'registerCitizen');

// Helper function to render the Registration component with router context
const renderRegistration = () => {
    return render(
        <MemoryRouter initialEntries={['/register']}>
            <Routes>
                <Route path="/register" element={<Registration />} />
                <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('Registration component', () => {
    // Reset all mocks before each test
    beforeEach(() => {
        mockRegister.mockReset();
        mockNavigate.mockReset();
        vi.clearAllMocks(); 
    });
    
    // Cleanup rendered components and restore timers after each test
    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    // Test: Verify all essential form elements are rendered
    it('renders name, surname, username, email, password fields and register button', () => {
        renderRegistration();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Surname')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
    });

    // Test: Verify loading indicator appears during form submission
    it('shows loading indicator while submitting', async () => {
        const user = userEvent.setup();
        // Mock register to never resolve, keeping the component in pending state
        mockRegister.mockImplementation(() => new Promise(() => {}));
        
        renderRegistration();
        await user.type(screen.getByLabelText('Name'), 'John');
        await user.type(screen.getByLabelText('Surname'), 'Doe');
        await user.type(screen.getByLabelText('Username'), 'johndoe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'secretpw');
        await user.click(screen.getByRole('button', { name: 'Register' }));
        
        expect(screen.getByText('Registering...')).toBeInTheDocument();
    });

    // Test: Verify complete successful registration flow
    it('performs successful registration flow: calls API, navigates to login', async () => {
        const user = userEvent.setup();
        const fakeUser = { id: 1, name: 'John', surname: 'Doe', username: 'johndoe', email: 'john@example.com' };
        mockRegister.mockResolvedValue(fakeUser);

        renderRegistration();
        await user.type(screen.getByLabelText('Name'), 'John');
        await user.type(screen.getByLabelText('Surname'), 'Doe');
        await user.type(screen.getByLabelText('Username'), 'johndoe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'secretpw');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        // Verify API was called with correct credentials
        expect(mockRegister).toHaveBeenCalledWith({ 
            name: 'John', 
            surname: 'Doe',
            username: 'johndoe',
            email: 'john@example.com', 
            password: 'secretpw' 
        });
        // Verify navigation to login page occurred
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    });

    // Test: Verify error modal appears when registration fails
    it('shows error modal with message on failed registration', async () => {
        const user = userEvent.setup();
        mockRegister.mockRejectedValue(new Error('Email already exists'));
        
        renderRegistration();
        await user.type(screen.getByLabelText('Name'), 'John');
        await user.type(screen.getByLabelText('Surname'), 'Doe');
        await user.type(screen.getByLabelText('Username'), 'johndoe');
        await user.type(screen.getByLabelText('Email'), 'existing@example.com');
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: 'Register' }));
        
        // Verify error modal and message are displayed
        expect(await screen.findByText('Registration error')).toBeInTheDocument();
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    // Test: Verify form fields have proper HTML5 validation attributes
    it('annotates fields with required and minLength attributes', () => {
        renderRegistration();
        const name = screen.getByLabelText('Name');
        const surname = screen.getByLabelText('Surname');
        const username = screen.getByLabelText('Username');
        const email = screen.getByLabelText('Email');
        const password = screen.getByLabelText('Password');

        expect(name).toHaveAttribute('required');
        expect(name).toHaveAttribute('type', 'text');
        expect(surname).toHaveAttribute('required');
        expect(surname).toHaveAttribute('type', 'text');
        expect(username).toHaveAttribute('required');
        expect(username).toHaveAttribute('type', 'text');
        expect(email).toHaveAttribute('required');
        expect(email).toHaveAttribute('type', 'email');
        expect(password).toHaveAttribute('required');
        expect(password).toHaveAttribute('minlength', '6');
    });

    // Test: Verify submit button is disabled during submission and prevents double-submit
    it('disables submit while pending and prevents double submit', async () => {
        const user = userEvent.setup();
        let resolveRegister;
        const registerPromise = new Promise((res) => { resolveRegister = res; });
        mockRegister.mockReturnValue(registerPromise);

        renderRegistration();
        await user.type(screen.getByLabelText('Name'), 'John');
        await user.type(screen.getByLabelText('Surname'), 'Doe');
        await user.type(screen.getByLabelText('Username'), 'johndoe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'secretpw');

        const button = screen.getByRole('button', { name: 'Register' });
        await user.click(button);

        // Verify button is disabled
        await waitFor(() => expect(button).toBeDisabled());
        expect(mockRegister).toHaveBeenCalledTimes(1);
        
        // Try to click again and verify API is not called twice
        await user.click(button);
        expect(mockRegister).toHaveBeenCalledTimes(1);
    });

    // Test: Verify loading indicator hides and navigation doesn't occur on error
    it('hides loading indicator and does not navigate on error', async () => {
        const user = userEvent.setup();
        mockRegister.mockRejectedValue(new Error('Username already taken'));

        renderRegistration();
        await user.type(screen.getByLabelText('Name'), 'John');
        await user.type(screen.getByLabelText('Surname'), 'Doe');
        await user.type(screen.getByLabelText('Username'), 'taken');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        // Verify error is shown
        expect(await screen.findByText('Registration error')).toBeInTheDocument();
        // Verify navigation did not occur
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    // Test: Verify loading indicator is visible during async operation
    it('shows loading indicator during async operation', async () => {
        const user = userEvent.setup();
        // Mock register that never resolves to keep loading state
        mockRegister.mockImplementation(() => new Promise(() => {}));

        renderRegistration();
        await user.type(screen.getByLabelText('Name'), 'John');
        await user.type(screen.getByLabelText('Surname'), 'Doe');
        await user.type(screen.getByLabelText('Username'), 'johndoe');
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        expect(screen.getByText('Registering...')).toBeInTheDocument();
    });

    // Test: Verify error modal can be closed and disappears from DOM
    it('clears error modal when closed', async () => {
        const user = userEvent.setup();
        mockRegister.mockRejectedValue(new Error('Invalid data'));

        renderRegistration();
        await user.type(screen.getByLabelText('Name'), 'John');
        await user.type(screen.getByLabelText('Surname'), 'Doe');
        await user.type(screen.getByLabelText('Username'), 'johndoe');
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpw');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        expect(await screen.findByText('Registration error')).toBeInTheDocument();
        
        // Click close button on modal
        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        // Verify modal is removed from DOM
        await waitFor(() => {
            expect(screen.queryByText('Registration error')).not.toBeInTheDocument();
        });
    });

    // Test: Verify input fields have correct name attributes for form data
    it('inputs expose correct name attributes for form submission', () => {
        renderRegistration();
        expect(screen.getByLabelText('Name')).toHaveAttribute('name', 'name');
        expect(screen.getByLabelText('Surname')).toHaveAttribute('name', 'surname');
        expect(screen.getByLabelText('Username')).toHaveAttribute('name', 'username');
        expect(screen.getByLabelText('Email')).toHaveAttribute('name', 'email');
        expect(screen.getByLabelText('Password')).toHaveAttribute('name', 'password');
    });

    // Test: Verify form can be submitted using Enter key
    it('submits with Enter key', async () => {
        const user = userEvent.setup();
        mockRegister.mockResolvedValue({ id: 1, name: 'John' });

        renderRegistration();
        await user.type(screen.getByLabelText('Name'), 'John');
        await user.type(screen.getByLabelText('Surname'), 'Doe');
        await user.type(screen.getByLabelText('Username'), 'johndoe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'secretpw');
        await user.keyboard('{Enter}');

        // Verify API was called after Enter key press
        await waitFor(() =>
            expect(mockRegister).toHaveBeenCalledWith({ 
                name: 'John',
                surname: 'Doe',
                username: 'johndoe',
                email: 'john@example.com', 
                password: 'secretpw' 
            })
        );
    });

    // Test: Verify input fields have appropriate placeholder text
    it('has correct placeholder text for input fields', () => {
        renderRegistration();
        expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your surname')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Choose a username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    // Test: Verify form has correct CSS class
    it('renders with correct CSS classes', () => {
        renderRegistration();
        const form = screen.getByRole('button', { name: 'Register' }).closest('form');
        expect(form).toHaveClass('registration-form');
    });

    // Test: Verify loading indicator is not shown on initial render
    it('does not show loading indicator initially', () => {
        renderRegistration();
        expect(screen.queryByText('Registering...')).not.toBeInTheDocument();
    });

    // Test: Verify error modal is not shown on initial render
    it('does not show error modal initially', () => {
        renderRegistration();
        expect(screen.queryByText('Registration error')).not.toBeInTheDocument();
    });

    // Test: Verify form data is preserved after registration failure
    it('maintains form data when registration fails', async () => {
        const user = userEvent.setup();
        mockRegister.mockRejectedValue(new Error('Server error'));

        renderRegistration();
        await user.type(screen.getByLabelText('Name'), 'John');
        await user.type(screen.getByLabelText('Surname'), 'Doe');
        await user.type(screen.getByLabelText('Username'), 'johndoe');
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        await screen.findByText('Registration error');

        // Verify input values are still present after error
        expect(screen.getByLabelText('Name')).toHaveValue('John');
        expect(screen.getByLabelText('Surname')).toHaveValue('Doe');
        expect(screen.getByLabelText('Username')).toHaveValue('johndoe');
        expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('password123');
    });

    // Test: Verify login link is present with correct text and href
    it('shows login link with correct text', () => {
        renderRegistration();
        expect(screen.getByText(/If you don't have an account/i)).toBeInTheDocument();
        const loginLink = screen.getByRole('link', { name: /login/i });
        expect(loginLink).toHaveAttribute('href', '/login');
    });

    // Test: Verify credentials are trimmed before being sent to API (except password)
    it('calls API with trimmed credentials', async () => {
        const user = userEvent.setup();
        mockRegister.mockResolvedValue({ id: 1 });

        renderRegistration();
        // Type credentials with leading/trailing spaces
        await user.type(screen.getByLabelText('Name'), '  John  ');
        await user.type(screen.getByLabelText('Surname'), '  Doe  ');
        await user.type(screen.getByLabelText('Username'), '  johndoe  ');
        await user.type(screen.getByLabelText('Email'), '  test@example.com  ');
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        // Verify API receives trimmed values (except password)
        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({ 
                name: 'John',
                surname: 'Doe',
                username: 'johndoe',
                email: 'test@example.com', 
                password: 'password' 
            });
        });
    });

    // Test: Verify register button has correct type attribute
    it('button has correct type attribute', () => {
        renderRegistration();
        const button = screen.getByRole('button', { name: 'Register' });
        expect(button).toHaveAttribute('type', 'submit');
    });

    // Test: Verify form fields have correct ID attributes for accessibility
    it('form fields have correct IDs', () => {
        renderRegistration();
        expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'formName');
        expect(screen.getByLabelText('Surname')).toHaveAttribute('id', 'formSurname');
        expect(screen.getByLabelText('Username')).toHaveAttribute('id', 'formUsername');
        expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'formEmail');
        expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'formPassword');
    });
});