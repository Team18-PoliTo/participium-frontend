# Manual Testing Document: Registration

## Registration Test

### Purpose
Verify that users can register correctly and that the system handles errors and edge cases.

### Components involved
- Registration form (name, surname, username, email, password)
- Register button
- Error modal
- Navigation to login page

### Test 1: Registration with valid data
- Open the registration page.
- Fill all fields with valid data (e.g., name: "Mario", surname: "Rossi", username: "mario123", email: "mario@example.com", password: "password123").
- Click the "Register" button.
- Verify that:
  - The system shows a loading indicator ("Registering...").
  - After completion, the user is redirected to the login page.
  - No error is shown.

### Test 2: Registration with incomplete data
- Open the registration page.
- Fill only some fields (e.g., name and surname, leaving username, email, or password empty).
- Click the "Register" button.
- Verify that:
  - The browser shows an HTML5 error message (required field).
  - The form is not submitted.

### Test 3: Registration with invalid email
- Open the registration page.
- Fill all fields, but enter an invalid email (e.g., "mario").
- Click the "Register" button.
- Verify that:
  - The browser shows an HTML5 error message (email format).
  - The form is not submitted.

### Test 4: Registration with too short password
- Open the registration page.
- Fill all fields, but enter a password with less than 6 characters.
- Click the "Register" button.
- Verify that:
  - The browser shows an HTML5 error message (minimum length).
  - The form is not submitted.

### Test 5: Registration with already existing data
- Open the registration page.
- Fill all fields with already registered data (e.g., email already used).
- Click the "Register" button.
- Verify that:
  - The system shows a loading indicator.
  - After the attempt, the error modal appears with the appropriate message.
  - The user remains on the registration page.

### Test 6: Closing the error modal
- Reproduce a registration error (e.g., existing data).
- Click the "Close" button on the error modal.
- Verify that:
  - The modal disappears.
  - The data entered in the form is still present.

### Test 7: Navigation via link
- Open the registration page.
- Click the "login" link in "If you already have an account, login".
- Verify that:
  - The user is redirected to the registration page.
