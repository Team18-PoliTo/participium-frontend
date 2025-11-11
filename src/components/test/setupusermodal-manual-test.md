# Manual Testing Document: SetUpUserModal

## SetUpUserModal Test

### Purpose
Verify that administrators can create new internal users through a modal form with proper validation and error handling.

### Components involved
- SetUpUserModal component (Bootstrap Modal)
- Form fields (Name, Surname, Email, Password)
- Create User button
- Error alert
- Close button

### Test 1: Modal does not appear when closed
- On the admin page.
- Verify that:
  - The SetUpUserModal is not visible initially.
  - No modal backdrop is present.

### Test 2: Open modal from admin page
- On the admin page.
- Click the "Add a new user" button.
- Verify that:
  - The SetUpUserModal opens.
  - The modal backdrop appears.
  - The modal is centered on screen.

### Test 3: Modal title and structure
- With the modal open.
- Verify that:
  - The modal title is "Add a new municipality user".
  - The close button (×) is present in the header.
  - All form fields are visible.

### Test 4: Form fields display
- With the modal open.
- Verify that:
  - "Name" field is present with label and placeholder "Enter name".
  - "Surname" field is present with label and placeholder "Enter surname".
  - "Email" field is present with label and placeholder "Enter email".
  - "Password" field is present with label and placeholder "Enter password".
  - "Create User" button is present and enabled.

### Test 5: Close modal with close button
- With the modal open.
- Click the close button (×) in the header.
- Verify that:
  - The modal closes.
  - The onClose callback is called.
  - Any error messages are cleared.

### Test 6: Static backdrop - cannot close by clicking outside
- With the modal open.
- Click on the backdrop (outside the modal).
- Verify that:
  - The modal does NOT close.
  - The modal remains open (backdrop="static").

### Test 7: Successful user creation
- Click "Add a new user".
- Fill in all fields:
  - Name: "John"
  - Surname: "Doe"
  - Email: "john@example.com"
  - Password: "password123"
- Click "Create User".
- Verify that:
  - A loading indicator appears ("Creating...").
  - The submit button is disabled during submission.
  - The onCreateUser callback is called with correct data.
  - The modal closes after success.
  - The form is reset.

### Test 8: Loading indicator during submission
- Fill in all fields with valid data.
- Click "Create User".
- Verify that:
  - "Creating..." text appears immediately.
  - The text is visible during the async operation.
  - The submit button is disabled.

### Test 9: User creation error - display alert
- Fill in fields with an email that already exists.
- Click "Create User".
- Verify that:
  - An error alert appears.
  - The alert shows the error message (e.g., "Email already exists").
  - The alert has a dismiss button.
  - The modal remains open.
  - Form data is preserved.

### Test 10: Dismiss error alert
- After an error is displayed.
- Click the dismiss button (×) on the error alert.
- Verify that:
  - The error alert disappears.
  - The form remains visible.
  - The form data is still present.

### Test 11: Required field validation - Name
- With the modal open.
- Leave the "Name" field empty.
- Fill other fields.
- Click "Create User".
- Verify that:
  - Browser shows HTML5 validation error.
  - The form is not submitted.
  - The onCreateUser callback is not called.

### Test 12: Required field validation - Surname
- Leave the "Surname" field empty.
- Fill other fields.
- Click "Create User".
- Verify that:
  - Browser shows HTML5 validation error.
  - The form is not submitted.

### Test 13: Required field validation - Email
- Leave the "Email" field empty.
- Fill other fields.
- Click "Create User".
- Verify that:
  - Browser shows HTML5 validation error.
  - The form is not submitted.

### Test 14: Required field validation - Password
- Leave the "Password" field empty.
- Fill other fields.
- Click "Create User".
- Verify that:
  - Browser shows HTML5 validation error.
  - The form is not submitted.

### Test 15: Email format validation
- Enter an invalid email (e.g., "notanemail").
- Fill other fields.
- Click "Create User".
- Verify that:
  - Browser shows HTML5 email format error.
  - The form is not submitted.

### Test 16: Submit with Enter key
- Fill in all fields.
- Press Enter key while focused on any field.
- Verify that:
  - The form is submitted.
  - The onCreateUser callback is called.
  - The same validation and submission process occurs.

### Test 17: Form reset after successful creation
- Create a user successfully.
- Reopen the modal.
- Verify that:
  - All fields are empty.
  - No previous data is retained.
  - No error messages are shown.

### Test 18: Error cleared when modal is closed
- Trigger an error.
- Close the modal using the close button.
- Reopen the modal.
- Verify that:
  - No error alert is shown.
  - The form is clean.

### Test 19: Submit button disabled during submission
- Fill in all fields.
- Click "Create User".
- Verify that:
  - The submit button becomes disabled.
  - Multiple clicks don't trigger multiple submissions.
  - The button text may change or show loading state.

### Test 20: Generic error message
- Simulate an error without a message property.
- Verify that:
  - The alert shows "Failed to create user".
  - The generic error message is displayed correctly.

### Test 21: Field IDs for accessibility
- Inspect the form fields.
- Verify that:
  - Name field has id "formName".
  - Surname field has id "formSurname".
  - Email field has id "formEmail".
  - Password field has id "formPassword".
  - Labels are correctly associated with fields.

### Test 22: Field names for form submission
- Inspect the form fields.
- Verify that:
  - Name field has name attribute "name".
  - Surname field has name attribute "surname".
  - Email field has name attribute "email".
  - Password field has name attribute "password".

### Test 23: Input types
- Inspect the form fields.
- Verify that:
  - Name and Surname fields are type="text".
  - Email field is type="email".
  - Password field is type="password" (hidden characters).

### Test 24: Submit button type
- Inspect the Create User button.
- Verify that:
  - The button has type="submit".
  - Clicking it submits the form.

### Test 25: CSS classes
- Inspect the modal structure.
- Verify that:
  - The modal has class "setup-user-modal".
  - The container has class "setup-user-container".
  - The form has class "setup-user-form".
  - Form controls have appropriate Bootstrap classes.

### Test 26: Two-column layout for Name/Surname
- With the modal open.
- Verify that:
  - Name and Surname fields are displayed side-by-side in a row.
  - Email and Password fields are full-width.
  - The layout is responsive.
