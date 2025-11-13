import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from '../Login';
import * as API from '../../API/API';
import { MemoryRouter, Route, Routes } from 'react-router';
import { UserContext } from '../../App'; // Import UserContext from App.jsx

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

// Spy on the loginCitizen and getUserInfo API methods to mock their behavior
const mockLoginCitizen = vi.spyOn(API.default, 'loginCitizen');
const mockGetUserInfo = vi.spyOn(API.default, 'getUserInfo');

// Helper function to render the Login component with router context and UserContext
const renderLogin = () => {
    const mockSetCitizenLoggedIn = vi.fn();
    const mockSetUserLoggedIn = vi.fn();
    const mockSetUser = vi.fn();
    const mockSetUserRole = vi.fn();

    const mockUserContext = {
        citizenLoggedIn: false,
        setCitizenLoggedIn: mockSetCitizenLoggedIn,
        userLoggedIn: false,
        setUserLoggedIn: mockSetUserLoggedIn,
        user: null,
        setUser: mockSetUser,
        userRole: null,
        setUserRole: mockSetUserRole,
    };

    return render(
        <UserContext.Provider value={mockUserContext}>
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/map" element={<div>Map Page</div>} />
                    <Route path="/register" element={<div>Register Page</div>} />
                </Routes>
            </MemoryRouter>
        </UserContext.Provider>
    );
};

describe('Login component', () => {
    // Reset all mocks and clear localStorage before each test
    beforeEach(() => {
        mockLoginCitizen.mockReset();
        mockGetUserInfo.mockReset();
        mockNavigate.mockReset();
        localStorage.clear();
        vi.clearAllMocks(); 
    });
    
    // Cleanup rendered components and restore timers after each test
    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    // Test: Verify all essential form elements are rendered
    it('renders email, password fields and login button', () => {
        renderLogin();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register');
    });

    // Test: Verify loading indicator appears during form submission
    it('shows loading indicator while submitting', async () => {
        const user = userEvent.setup();
        // Mock login to never resolve, keeping the component in pending state
        mockLoginCitizen.mockImplementation(() => new Promise(() => {}));
        
        renderLogin();
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'secretpw');
        await user.click(screen.getByRole('button', { name: 'Login' }));
        
        expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });

    // Test: Verify complete successful login flow
    it('performs successful login flow: calls API, stores token, navigates', async () => {
        const user = userEvent.setup();
        const fakeToken = { accessToken: 'abc123', tokenType: 'Bearer' };
        const fakeUser = { id: 1, email: 'john@example.com', profile: { role: 'citizen' } };
        
        // Mock successful login that returns token AND stores it in localStorage
        mockLoginCitizen.mockImplementation(async (credentials) => {
            // Simulate what the real API does: store token in localStorage
            localStorage.setItem('authToken', JSON.stringify(fakeToken.accessToken));
            return fakeToken;
        });
        
        // Mock getUserInfo to return user data
        mockGetUserInfo.mockResolvedValue(fakeUser);

        renderLogin();
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'secretpw');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        // Verify API was called with correct credentials
        await waitFor(() => {
            expect(mockLoginCitizen).toHaveBeenCalledWith({ 
                email: 'john@example.com', 
                password: 'secretpw' 
            });
        });
        
        // Verify token was stored (parse the JSON string)
        await waitFor(() => {
            const storedToken = JSON.parse(localStorage.getItem('authToken'));
            expect(storedToken).toBe(fakeToken.accessToken);
        });
        
        // Verify getUserInfo was called
        await waitFor(() => {
            expect(mockGetUserInfo).toHaveBeenCalled();
        });
        
        // Verify navigation to map page occurred
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/map');
        });
    });

    // Test: Verify error modal appears when login fails
    it('shows error modal with message on failed login (401)', async () => {
        const user = userEvent.setup();
        mockLoginCitizen.mockRejectedValue(new Error('Invalid email or password'));
        
        renderLogin();
        await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpw');
        await user.click(screen.getByRole('button', { name: 'Login' }));
        
        // Verify error modal and message are displayed
        expect(await screen.findByText('Login error')).toBeInTheDocument();
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });

    // Test: Verify form fields have proper HTML5 validation attributes
    it('annotates fields with required and minLength attributes', () => {
        renderLogin();
        const email = screen.getByLabelText('Email');
        const password = screen.getByLabelText('Password');

        expect(email).toHaveAttribute('required');
        expect(email).toHaveAttribute('type', 'email');
        expect(password).toHaveAttribute('required');
        expect(password).toHaveAttribute('minlength', '6');
    });

    // Test: Verify submit button is disabled during submission and prevents double-submit
    it('disables submit while pending and prevents double submit', async () => {
        const user = userEvent.setup();
        let resolveLogin;
        const loginPromise = new Promise((res) => { resolveLogin = res; });
        mockLoginCitizen.mockReturnValue(loginPromise);

        renderLogin();
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'secretpw');

        const button = screen.getByRole('button', { name: 'Login' });
        await user.click(button);

        // Verify button is disabled
        await waitFor(() => expect(button).toBeDisabled());
        expect(mockLoginCitizen).toHaveBeenCalledTimes(1);
        
        // Try to click again and verify API is not called twice
        await user.click(button);
        expect(mockLoginCitizen).toHaveBeenCalledTimes(1);
    });

    // Test: Verify loading indicator hides and navigation doesn't occur on error
    it('hides loading indicator and does not navigate on error', async () => {
        const user = userEvent.setup();
        mockLoginCitizen.mockRejectedValue(new Error('Invalid email or password'));

        renderLogin();
        await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpw');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        // Verify error is shown
        expect(await screen.findByText('Login error')).toBeInTheDocument();
        // Verify navigation did not occur
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    // Test: Verify loading indicator is visible during async operation
    it('shows loading indicator during async operation', async () => {
        const user = userEvent.setup();
        // Mock login that never resolves to keep loading state
        mockLoginCitizen.mockImplementation(() => new Promise(() => {}));

        renderLogin();
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });

    // Test: Verify error modal can be closed and disappears from DOM
    it('clears error modal when closed', async () => {
        const user = userEvent.setup();
        mockLoginCitizen.mockRejectedValue(new Error('Invalid credentials'));

        renderLogin();
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpw');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        expect(await screen.findByText('Login error')).toBeInTheDocument();
        
        // Click close button on modal
        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        // Verify modal is removed from DOM
        await waitFor(() => {
            expect(screen.queryByText('Login error')).not.toBeInTheDocument();
        });
    });

    // Test: Verify input fields have correct name attributes for form data
    it('inputs expose correct name attributes for form submission', () => {
        renderLogin();
        expect(screen.getByLabelText('Email')).toHaveAttribute('name', 'email');
        expect(screen.getByLabelText('Password')).toHaveAttribute('name', 'password');
    });

    // Test: Verify form can be submitted using Enter key
    it('submits with Enter key', async () => {
        const user = userEvent.setup();
        const fakeToken = { accessToken: 't', tokenType: 'Bearer' };
        const fakeUser = { id: 1, email: 'john@example.com', profile: { role: 'citizen' } };
        
        mockLoginCitizen.mockResolvedValue(fakeToken);
        mockGetUserInfo.mockResolvedValue(fakeUser);

        renderLogin();
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'secretpw');
        await user.keyboard('{Enter}');

        // Verify API was called after Enter key press
        await waitFor(() =>
            expect(mockLoginCitizen).toHaveBeenCalledWith({ 
                email: 'john@example.com', 
                password: 'secretpw' 
            })
        );
    });

    // Test: Verify input fields have appropriate placeholder text
    it('has correct placeholder text for input fields', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    // Test: Verify form has correct CSS class
    it('renders with correct CSS classes', () => {
        renderLogin();
        const form = screen.getByRole('button', { name: 'Login' }).closest('form');
        expect(form).toHaveClass('login-form');
    });

    // Test: Verify loading indicator is not shown on initial render
    it('does not show loading indicator initially', () => {
        renderLogin();
        expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
    });

    // Test: Verify error modal is not shown on initial render
    it('does not show error modal initially', () => {
        renderLogin();
        expect(screen.queryByText('Login error')).not.toBeInTheDocument();
    });

    // Test: Verify form data is preserved after login failure
    it('maintains form data when login fails', async () => {
        const user = userEvent.setup();
        mockLoginCitizen.mockRejectedValue(new Error('Server error'));

        renderLogin();
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        await screen.findByText('Login error');

        // Verify input values are still present after error
        expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('password123');
    });

    // Test: Verify register link is present with correct text and href
    it('shows register link with correct text', () => {
        renderLogin();
        expect(screen.getByText(/If you don't have an account/i)).toBeInTheDocument();
        const registerLink = screen.getByRole('link', { name: /register/i });
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    // Test: Verify credentials are trimmed before being sent to API
    it('calls API with trimmed credentials', async () => {
        const user = userEvent.setup();
        const fakeToken = { accessToken: 't', tokenType: 'Bearer' };
        const fakeUser = { id: 1, email: 'test@example.com', profile: { role: 'citizen' } };
        
        mockLoginCitizen.mockResolvedValue(fakeToken);
        mockGetUserInfo.mockResolvedValue(fakeUser);

        renderLogin();
        // Type credentials with leading/trailing spaces
        await user.type(screen.getByLabelText('Email'), '  test@example.com  ');
        await user.type(screen.getByLabelText('Password'), '  password  ');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        // Verify API receives trimmed values
        await waitFor(() => {
            expect(mockLoginCitizen).toHaveBeenCalledWith({ 
                email: 'test@example.com', 
                password: 'password' 
            });
        });
    });

    // Test: Verify login button has correct type attribute
    it('button has correct type attribute', () => {
        renderLogin();
        const button = screen.getByRole('button', { name: 'Login' });
        expect(button).toHaveAttribute('type', 'submit');
    });

    // Test: Verify form fields have correct ID attributes for accessibility
    it('form fields have correct IDs', () => {
        renderLogin();
        expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'formEmail');
        expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'formPassword');
    });

});

