# Manual Testing Document: RoleAssignmentModal

## RoleAssignmentModal Test

### Purpose
Verify that administrators can assign roles to users through a modal interface with correct display and interaction.

### Components involved
- RoleAssignmentModal component
- Role selection buttons
- Close button
- Modal overlay

### Test 1: Modal does not appear when closed
- On a page with UserCard component.
- Verify that:
  - The RoleAssignmentModal is not visible initially.
  - No modal overlay is present.

### Test 2: Open modal from UserCard
- On the admin page with an unassigned user.
- Click the "add" button (plus icon) on an unassigned user card.
- Verify that:
  - The RoleAssignmentModal opens.
  - The modal is displayed with correct styling.
  - The modal overlay appears.

### Test 3: Modal title and subtitle
- With the modal open for user "John Doe".
- Verify that:
  - The modal title is "Assign Role".
  - The subtitle shows "Select a role for John Doe".
  - The user's name is correctly displayed.

### Test 4: Close button functionality
- With the modal open.
- Click the "×" close button in the top right.
- Verify that:
  - The modal closes.
  - The modal disappears from the DOM.
  - The user card remains visible.

### Test 5: Close modal by clicking overlay
- With the modal open.
- Click on the semi-transparent overlay (outside the modal content).
- Verify that:
  - The modal closes.
  - The interaction returns to the main page.

### Test 6: Modal content does not close on click
- With the modal open.
- Click inside the modal content area (but not on a role option).
- Verify that:
  - The modal remains open.
  - Nothing happens.

### Test 7: Display available roles
- With the modal open.
- Verify that:
  - Project Manager role is displayed.
  - Technician role is displayed.
  - Administrator role is displayed.
  - "Citizen" role is NOT displayed (filtered out by id > 1).

### Test 8: Role option icons
- With the modal open.
- Verify that for each role option:
  - The correct icon is displayed.
  - The icon matches the role type.
  - Icons are clearly visible.

### Test 9: Role option names
- With the modal open.
- Verify that:
  - Each role option shows the role name.
  - Names are clearly readable.
  - Names match the role icons.

### Test 10: Assign Project Manager role
- With the modal open for an unassigned user.
- Click on the "Project Manager" role option.
- Verify that:
  - The onAssignRole callback is called with the correct user ID and role ID (2).
  - The modal closes after selection.
  - The user card updates to show the new role.

### Test 11: Assign Technician role
- With the modal open for an unassigned user.
- Click on the "Technician" role option.
- Verify that:
  - The onAssignRole callback is called with the correct user ID and role ID (3).
  - The modal closes.
  - The user's role is updated.

### Test 12: Assign Administrator role
- With the modal open for an unassigned user.
- Click on the "Administrator" role option.
- Verify that:
  - The onAssignRole callback is called with the correct user ID and role ID (4).
  - The modal closes.
  - The user's role is updated.

### Test 13: Handle undefined availableRoles
- Simulate undefined availableRoles prop.
- Verify that:
  - The modal still opens.
  - No role options are displayed.
  - No errors occur.
  - The modal can still be closed.

### Test 14: Handle empty availableRoles array
- Simulate empty availableRoles array.
- Verify that:
  - The modal still opens.
  - No role options are displayed.
  - The modal title and subtitle are still shown.
  - The modal can be closed.

### Test 15: CSS classes and styling
- With the modal open.
- Verify that:
  - The modal overlay has class "role-modal-overlay".
  - The modal content has class "role-modal-content".
  - The modal has correct background color (#E1EDF4).
  - Role options have correct background color (#98C1D9).

### Test 16: Multiple users - different names
- Open the modal for user "Jane Smith".
- Verify that:
  - The subtitle shows "Select a role for Jane Smith".
  - Then open modal for user "Bob Wilson".
  - The subtitle updates to "Select a role for Bob Wilson".

### Test 17: Role option hover/click states
- With the modal open.
- Hover over different role options.
- Click on a role option.
- Verify that:
  - Visual feedback is provided (if styled).
  - The selection is processed correctly.

### Test 18: Accessibility - close button
- With the modal open.
- Verify that:
  - The close button has the correct class "role-modal-close".
  - The close button is easily clickable.
  - The "×" symbol is clearly visible.

### Test 19: Modal z-index and overlay
- With the modal open.
- Verify that:
  - The modal appears above all other content.
  - The overlay prevents interaction with background elements.
  - The modal is centered on screen.

### Test 20: Rapid open/close
- Quickly open and close the modal multiple times.
- Verify that:
  - No errors occur.
  - The modal state is correctly managed.
  - Each opening shows the correct user information.
