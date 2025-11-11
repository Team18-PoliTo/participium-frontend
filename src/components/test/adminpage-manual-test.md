# Manual Testing Document: AdminPage

## AdminPage Test

### Purpose
Verify that administrators can view, filter, and manage internal users correctly, including role assignment and user creation.

### Components involved
- User list display
- Filter buttons by role
- Legend section
- Add user button
- SetUpUserModal
- UserCard components
- RoleAssignmentModal (via UserCard)

### Test 1: Initial page load and data display
- Log in as an administrator.
- Navigate to the admin page.
- Verify that:
  - All roles are fetched and displayed (excluding "Citizen" from filters).
  - All internal users are fetched and displayed.
  - The "Add a new user" button is visible.
  - Filter buttons are displayed (Project Manager, Technician, Administrator).
  - The legend section shows all roles with their icons.

### Test 2: Filter users by role
- On the admin page with multiple users displayed.
- Click on the "Project Manager" filter button.
- Verify that:
  - The filter button becomes active (highlighted).
  - Only users with the "Project Manager" role are displayed.
  - Other users are filtered out.

### Test 3: Remove filter
- With an active filter applied (e.g., "Project Manager").
- Click the same filter button again.
- Verify that:
  - The filter button becomes inactive.
  - All users are displayed again.

### Test 4: Switch between different filters
- On the admin page.
- Click on "Project Manager" filter.
- Then click on "Technician" filter.
- Verify that:
  - Only the "Technician" filter is active.
  - Only users with "Technician" role are displayed.
  - The previous filter is automatically deactivated.

### Test 5: Open add user modal
- On the admin page.
- Click the "Add a new user" button.
- Verify that:
  - The SetUpUserModal opens.
  - The modal title is "Add a new municipality user".
  - All form fields are present (Name, Surname, Email, Password).

### Test 6: Create a new user successfully
- Click "Add a new user" button.
- Fill in all fields with valid data (e.g., Name: "John", Surname: "Doe", Email: "john@example.com", Password: "password123").
- Click "Create User" button.
- Verify that:
  - A loading indicator appears ("Creating...").
  - The API is called with the correct data.
  - The modal closes after successful creation.
  - The new user appears in the user list.

### Test 7: Handle user creation error
- Click "Add a new user" button.
- Fill in fields with already existing email.
- Click "Create User" button.
- Verify that:
  - An error alert appears with the error message.
  - The modal remains open.
  - The form data is preserved.

### Test 8: Verify legend display
- On the admin page.
- Locate the legend section on the right.
- Verify that:
  - All visible roles are listed with their corresponding icons.
  - The "Citizen" role is not shown in the legend.
  - Icons match the ones used in the user cards.

### Test 9: Verify user card display
- On the admin page with users loaded.
- Verify that for each user card:
  - User's first name is displayed.
  - User's last name is displayed.
  - User's email is displayed.
  - The correct role icon is shown.
  - For unassigned users, an "add" button (plus icon) is visible.
  - For assigned users, no "add" button is shown.

### Test 10: Verify divider line
- On the admin page.
- Verify that:
  - A divider line separates the filter/legend section from the user list.
  - The layout is organized correctly.

### Test 11: Empty user list
- If possible, test with no users in the system.
- Verify that:
  - The page still renders correctly.
  - The "Add a new user" button is still functional.
  - Filters and legend are still displayed.

### Test 12: Error handling - fetch roles fails
- Simulate a network error when fetching roles.
- Verify that:
  - The error is logged to the console.
  - The page doesn't crash.
  - An appropriate error message or state is shown.

### Test 13: Error handling - fetch users fails
- Simulate a network error when fetching users.
- Verify that:
  - The error is logged to the console.
  - The page doesn't crash.
  - An appropriate error message or state is shown.

### Test 14: Verify CSS classes and styling
- On the admin page.
- Inspect the elements.
- Verify that:
  - The main container has class "admin-board".
  - The sidebar has class "admin-sidebar".
  - The legend section has class "admin-legend-section".
  - The user list has class "user-list".
  - All elements are styled correctly.

### Test 15: Verify citizens are filtered out
- Ensure there are users with "Citizen" role in the database.
- Navigate to the admin page.
- Verify that:
  - Users with "Citizen" role are not displayed.
  - Only internal users (Project Manager, Technician, Administrator, Unassigned) are shown.
