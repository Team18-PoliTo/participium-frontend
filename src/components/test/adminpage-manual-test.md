# Manual Testing Document: AdminPage

## Purpose
This document outlines manual tests for the `AdminPage`, focusing on visual verification, user interaction, and data flows that are not fully covered by automated tests.

### Pre-conditions
- Log in as an Administrator.
- Navigate to the Admin Page.

---

### Test 1: Visual Layout and Component Rendering
- **Objective:** Verify that all UI elements on the Admin Page are displayed correctly.
- **Steps:**
  1. Load the Admin Page.
  2. **Verify:**
     - The main title "Admin Page" is visible.
     - The "Set Up User" button is present and clickable.
     - The search bar is displayed with the placeholder "Search by name, surname, or email".
     - The role legend (Administrator, Project Manager, Technician, Unassigned) is clear and visible.
     - The list of user cards is rendered below the search bar.

---

### Test 2: User Loading and Display
- **Objective:** Ensure that users are fetched and displayed correctly in user cards.
- **Steps:**
  1. On the Admin Page, observe the user list.
  2. **Verify:**
     - A list of user cards is displayed.
     - Each card shows the user's name, surname, and email.
     - Each card displays the correct role icon corresponding to the user's role.

---

### Test 3: Search Functionality
- **Objective:** Verify that the search bar correctly filters the user list.
- **Steps:**
  1. Identify a unique user in the list (e.g., with a unique name).
  2. Type the user's name into the search bar.
  3. **Verify:**
     - The user list filters in real-time.
     - Only the user(s) matching the search query are displayed.
  4. Clear the search bar.
  5. **Verify:**
     - The full list of users is displayed again.
  6. Perform a search that yields no results (e.g., type "xyz").
  7. **Verify:**
     - A "No users found" message is displayed.

---

### Test 4: "Set Up User" Modal Flow
- **Objective:** Verify that the "Set Up User" button correctly opens the modal for creating a new user.
- **Steps:**
  1. Click the "Set Up User" button.
  2. **Verify:**
     - The `SetUpUserModal` opens correctly.
     - The modal title is "Set Up New User".
  3. Close the modal using the close button.
  4. **Verify:**
     - The modal closes, and the Admin Page is visible again.
