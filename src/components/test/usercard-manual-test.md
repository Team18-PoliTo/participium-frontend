# Manual Testing Document: UserCard

## UserCard Test

### Purpose
Verify that user cards display user information correctly and allow role assignment for unassigned users.

### Components involved
- UserCard component
- User information display
- User role icon
- Add button (plus icon)
- RoleAssignmentModal (triggered from UserCard)

### Test 1: Display user information
- On the admin page with users loaded.
- Locate a user card.
- Verify that:
  - The user's first name is displayed with label "name:".
  - The user's last name is displayed with label "surname:".
  - The user's email is displayed with label "email:".
  - All information is clearly readable.

### Test 2: Display correct role icon for assigned user
- Locate a user card for a user with "Project Manager" role.
- Verify that:
  - The Project Manager icon is displayed.
  - The icon alt text is "Project Manager".
  - The icon matches the one shown in the legend.

### Test 3: Display correct role icon for Technician
- Locate a user card for a user with "Technician" role.
- Verify that:
  - The Technician icon is displayed.
  - The icon is correct and visible.

### Test 4: Display correct role icon for Administrator
- Locate a user card for a user with "Administrator" role.
- Verify that:
  - The Administrator icon is displayed.
  - The icon is correct and visible.

### Test 5: Display unassigned user icon
- Locate a user card for an unassigned user (roleId = 0).
- Verify that:
  - The unassigned icon is displayed.
  - The icon alt text is "Unassigned".

### Test 6: Add button visible for unassigned user
- Locate an unassigned user card.
- Verify that:
  - An add button is visible.
  - The button has class "user-add-btn".
  - The button contains a plus icon (class "plus-icon").
  - The button is clickable.

### Test 7: Add button NOT visible for assigned user
- Locate a user card with an assigned role (e.g., Project Manager).
- Verify that:
  - No add button is present.
  - No plus icon is visible.
  - The card shows only user information and role icon.

### Test 8: Open RoleAssignmentModal from unassigned user
- Locate an unassigned user card.
- Click the add button (plus icon).
- Verify that:
  - The RoleAssignmentModal opens.
  - The modal shows "Assign Role" as title.
  - The modal subtitle shows the user's full name.
  - Available roles are displayed.

### Test 9: Modal does not appear initially
- Load the admin page with user cards.
- Verify that:
  - No RoleAssignmentModal is visible initially.
  - The modal only appears when the add button is clicked.

### Test 10: Close RoleAssignmentModal
- Open the modal from an unassigned user card.
- Click the close button (×) on the modal.
- Verify that:
  - The modal closes.
  - The user card remains visible.
  - The user is still unassigned.

### Test 11: Assign role through modal
- Open the modal for an unassigned user.
- Select "Project Manager" role.
- Verify that:
  - The onAssignRole callback is called with the correct user ID and role ID.
  - The modal closes automatically.
  - The user card updates (if state updates correctly).

### Test 12: Modal closes after role assignment
- Open the modal for an unassigned user.
- Click on any role option (e.g., Technician).
- Verify that:
  - The modal closes immediately after selection.
  - The role assignment is processed.

### Test 13: Multiple user cards display correctly
- On the admin page with multiple users.
- Verify that:
  - Each user card displays its own information.
  - Icons are correct for each user's role.
  - Add buttons appear only on unassigned user cards.

### Test 14: User card CSS structure
- Inspect a user card.
- Verify that:
  - The card has class "user-card".
  - The user info section has class "user-info".
  - The icon has class "user-icon".
  - Info labels have class "info-label".

### Test 15: Plus icon structure for add button
- Locate an unassigned user card.
- Inspect the add button.
- Verify that:
  - The button contains a div with class "plus-icon".
  - The plus icon is visually clear.

### Test 16: Display different user data
- Compare multiple user cards.
- Verify that:
  - Each card shows unique user information.
  - Names, surnames, and emails are different.
  - No data is mixed between cards.

### Test 17: Handle undefined availableRoles
- If availableRoles is undefined.
- Verify that:
  - The user card still displays.
  - User information is shown correctly.
  - The component doesn't crash.

### Test 18: Handle empty availableRoles array
- If availableRoles is an empty array.
- Verify that:
  - The user card still displays.
  - User information is shown.
  - The add button behavior is handled gracefully.

### Test 19: Fallback icon for unknown role
- If a user has a role not in the iconMap.
- Verify that:
  - A fallback/default icon is displayed.
  - The card doesn't show a broken image.
  - The user information is still visible.

### Test 20: Role assignment - Project Manager
- Open modal for unassigned user.
- Select "Project Manager".
- Verify that:
  - onAssignRole is called with roleId = 2.
  - The correct parameters are passed.

### Test 21: Role assignment - Technician
- Open modal for unassigned user.
- Select "Technician".
- Verify that:
  - onAssignRole is called with roleId = 3.
  - The correct parameters are passed.

### Test 22: Role assignment - Administrator
- Open modal for unassigned user.
- Select "Administrator".
- Verify that:
  - onAssignRole is called with roleId = 4.
  - The correct parameters are passed.

### Test 23: Close modal by clicking overlay
- Open the RoleAssignmentModal from a user card.
- Click on the modal overlay (outside the modal content).
- Verify that:
  - The modal closes.
  - The user card remains in its original state.

### Test 24: Correct props passed to RoleAssignmentModal
- Open modal from user card.
- Verify that:
  - The user prop is correctly passed (shows correct name).
  - The availableRoles prop is passed.
  - The onAssignRole callback works.
  - The onClose callback works.

### Test 25: Info labels are correctly styled
- Inspect a user card.
- Verify that:
  - There are exactly 3 info labels (name, surname, email).
  - Each label has class "info-label".
  - Labels are visually distinct from the values.

### Test 26: User card for citizen role (if applicable)
- If a citizen user exists in the system.
- Verify that:
  - The card is NOT shown on the admin page.
  - Only internal users are displayed.

### Test 27: Correctly identifies unassigned user (roleId = 0)
- Locate a user with roleId = 0.
- Verify that:
  - The add button is shown.
  - The user is correctly identified as unassigned.

### Test 28: Correctly identifies assigned user (roleId > 0)
- Locate a user with roleId > 0.
- Verify that:
  - NO add button is shown.
  - The user is correctly identified as assigned.
