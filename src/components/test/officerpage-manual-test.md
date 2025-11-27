# Manual Testing Document: OfficerPage

## Purpose
Verify that Officers (technical/operational users) can view, filter, and sort their assigned reports correctly, and can view report details in read-only mode.

## Components involved
- Reports list
- Date range filters (start date, end date)
- Sort order dropdown
- Status filter dropdown
- Reset filters button
- Report cards
- Report description modal (read-only)
- Role header with icon

---

## Pre-conditions
- Log in as an Officer (e.g., "Street Maintenance Operator", "Public Lighting Operator", "Waste Management Operator", etc.)
- Navigate to the Officer Page
- Ensure there are reports assigned to the logged-in officer

---

## Test 1: Initial page load
**Objective:** Verify that the page loads correctly with all assigned reports.

**Steps:**
1. Log in as an Officer.
2. Navigate to the Officer Page.

**Verify:**
- A loading spinner appears with "Loading reports..." message.
- After loading, all reports assigned to the officer are displayed.
- Reports are sorted by newest first (default).
- The role header shows the correct role icon and role name (e.g., "Street Maintenance Operator").
- The counter shows the correct number of reports (e.g., "Showing 5 reports assigned to you").
- All filter dropdowns and date pickers show default values.

---

## Test 2: Role header display
**Objective:** Verify that the role header displays correctly for different officer roles.

**Steps:**
1. Log in as different officers (e.g., Public Lighting Operator, Waste Management Operator).
2. Navigate to the Officer Page for each.

**Verify:**
- The role icon circle is displayed with the correct icon for the role.
- The role name is displayed correctly next to the icon.
- The styling is consistent across different roles.

---

## Test 3: Report card display
**Objective:** Verify that report cards display all required information correctly.

**Steps:**
1. On the Officer Page, observe the list of report cards.

**Verify:**
- Each card shows:
  - Category icon in a circular container
  - Report title
  - Location (address or coordinates if address not available)
  - Category badge
  - Status badge in the top-right corner
- Status badge has the correct color/style based on status:
  - "Assigned" status badge
  - "In Progress" status badge
  - "Suspended" status badge
  - "Resolved" status badge
- Cards are clickable (cursor changes to pointer on hover)

---

## Test 4: Filter by start date
**Objective:** Verify that the start date filter works correctly.

**Steps:**
1. Click on the "Start Date" picker.
2. Select a date in the past (e.g., one week ago).

**Verify:**
- Only reports created on or after the selected date are shown.
- The counter updates to reflect the filtered count.
- Reports created before the selected date are hidden.
- The date appears in dd/MM/yyyy format in the picker.

---

## Test 5: Filter by end date
**Objective:** Verify that the end date filter works correctly.

**Steps:**
1. Click on the "End Date" picker.
2. Select a date (e.g., yesterday).

**Verify:**
- Only reports created on or before the selected date (until 23:59:59) are shown.
- The counter updates accordingly.
- Reports created after the selected date are hidden.
- The date appears in dd/MM/yyyy format in the picker.

---

## Test 6: Filter by date range
**Objective:** Verify that filtering by both start and end date works correctly.

**Steps:**
1. Select a start date (e.g., two weeks ago).
2. Select an end date (e.g., one week ago).

**Verify:**
- Only reports within the date range are displayed.
- The counter shows the correct filtered count.
- Reports outside the range are hidden.

---

## Test 7: Filter by status - All
**Objective:** Verify that selecting "All" shows all reports.

**Steps:**
1. Click the "Status" dropdown.
2. Select "All".

**Verify:**
- All assigned reports are displayed.
- The dropdown shows "All" as selected.
- The counter shows the total number of reports.

---

## Test 8: Filter by status - Assigned
**Objective:** Verify that filtering by "Assigned" status works correctly.

**Steps:**
1. Click the "Status" dropdown.
2. Select "Assigned".

**Verify:**
- Only reports with status "Assigned" are displayed.
- The dropdown shows "Assigned" as selected.
- The counter updates to show only assigned reports.
- All displayed cards have "Assigned" status badge.

---

## Test 9: Filter by status - In Progress
**Objective:** Verify that filtering by "In Progress" status works correctly.

**Steps:**
1. Click the "Status" dropdown.
2. Select "In Progress".

**Verify:**
- Only reports with status "In Progress" are displayed.
- The dropdown shows "In Progress" as selected.
- The counter updates accordingly.
- All displayed cards have "In Progress" status badge.

---

## Test 10: Filter by status - Suspended
**Objective:** Verify that filtering by "Suspended" status works correctly.

**Steps:**
1. Click the "Status" dropdown.
2. Select "Suspended".

**Verify:**
- Only reports with status "Suspended" are displayed.
- The dropdown shows "Suspended" as selected.
- The counter updates accordingly.
- All displayed cards have "Suspended" status badge.

---

## Test 11: Filter by status - Resolved
**Objective:** Verify that filtering by "Resolved" status works correctly.

**Steps:**
1. Click the "Status" dropdown.
2. Select "Resolved".

**Verify:**
- Only reports with status "Resolved" are displayed.
- The dropdown shows "Resolved" as selected.
- The counter updates accordingly.
- All displayed cards have "Resolved" status badge.

---

## Test 12: Sort by date - Newest First
**Objective:** Verify that sorting by newest first works correctly.

**Steps:**
1. Click the "Sort by Date" dropdown.
2. Select "Newest First".

**Verify:**
- Reports are ordered with the most recent at the top.
- The dropdown shows "Newest First" as selected.
- The creation dates decrease as you scroll down.

---

## Test 13: Sort by date - Oldest First
**Objective:** Verify that sorting by oldest first works correctly.

**Steps:**
1. Click the "Sort by Date" dropdown.
2. Select "Oldest First".

**Verify:**
- Reports are ordered with the oldest at the top.
- The dropdown shows "Oldest First" as selected.
- The creation dates increase as you scroll down.

---

## Test 14: Combine multiple filters
**Objective:** Verify that multiple filters work together correctly.

**Steps:**
1. Select a status filter (e.g., "In Progress").
2. Select a start date.
3. Select an end date.
4. Change the sort order to "Oldest First".

**Verify:**
- All filters are applied simultaneously.
- Only reports matching all criteria are shown.
- Reports are sorted according to the selected order.
- The counter reflects the filtered results.

---

## Test 15: Reset filters
**Objective:** Verify that the reset button clears all filters.

**Steps:**
1. Apply multiple filters:
   - Select a status (e.g., "Assigned")
   - Select a start date
   - Select an end date
   - Change sort order to "Oldest First"
2. Click the "Reset" button.

**Verify:**
- Status filter returns to "All".
- Start date picker is cleared.
- End date picker is cleared.
- Sort order returns to "Newest First".
- All reports are displayed again.
- The counter shows the total number of reports.

---

## Test 16: No reports matching filters
**Objective:** Verify the display when no reports match the selected filters.

**Steps:**
1. Apply filters that result in no matches (e.g., status "Resolved" + very recent date range with no resolved reports).

**Verify:**
- An info alert appears: "No reports found matching the selected filters."
- The counter shows "Showing 0 reports assigned to you".
- No report cards are displayed.
- The filters remain active.

---

## Test 17: Click on a report card
**Objective:** Verify that clicking a report card opens the detail modal correctly.

**Steps:**
1. Click on any report card in the list.

**Verify:**
- The `ReportDescriptionModal` opens.
- The modal title is "Report Details".
- The modal displays all report information (see Test 18 for details).
- The filters remain applied in the background.

---

## Test 18: Report description modal - Read-only view
**Objective:** Verify that the report modal displays correctly for officers (read-only).

**Steps:**
1. Click on a report card to open the modal.
2. Review all displayed information.

**Verify the modal displays:**
- **Citizen Details:**
  - First Name
  - Last Name
- **Report Information:**
  - Title
  - Description
  - Address (with map pin icon)
- **Location:**
  - Interactive map showing the exact location with a marker
  - Map is not draggable or zoomable (static view)
- **Category:**
  - Category icon and name (read-only, no dropdown)
- **Status:**
  - Current status of the report
- **Creation Date:**
  - Date and time in format: "Month Day, Year, HH:MM AM/PM"
- **Photos:**
  - Thumbnails of all included photos (if any)
  - "No photos included" message if no photos

**Verify that:**
- The category is displayed as text with icon (NOT as a dropdown).
- There are NO action buttons (Approve/Reject).
- There is NO explanation textarea.
- The close button (X) is present in the header.

---

## Test 19: View report photos
**Objective:** Verify that report photos can be viewed in full size.

**Steps:**
1. Open a report that has photos.
2. Click on one of the photo thumbnails.

**Verify:**
- A photo preview modal opens.
- The modal title is "Photo Preview".
- The photo is displayed in full size on a dark background.
- The modal can be closed via the close button (X).
- After closing, the report details modal is still open.

---

## Test 20: Close report modal
**Objective:** Verify that the report modal closes correctly.

**Steps:**
1. Open a report card.
2. Click the close button (X) in the modal header.

**Verify:**
- The modal closes.
- The Officer Page is visible again.
- The filters remain as they were before opening the modal.
- The report list has not changed.

---

## Test 21: Report address geocoding
**Objective:** Verify that report addresses are loaded correctly.

**Steps:**
1. Observe report cards as they load on the page.

**Verify:**
- Initially, coordinates may be shown (latitude, longitude with 4 decimal places).
- As the page loads, addresses are progressively fetched and displayed.
- If an address cannot be loaded, coordinates remain displayed.
- The geocoding happens only for visible cards (lazy loading).

---

## Test 22: Error handling - Failed to load reports
**Objective:** Verify error handling when reports cannot be loaded.

**Steps:**
1. Simulate a network error (disconnect network or use browser dev tools).
2. Reload the Officer Page.

**Verify:**
- A loading spinner appears initially.
- After the error, a danger alert appears: "Failed to load your assigned reports. Please try again later."
- No reports are displayed.
- The page layout remains intact.

---

## Test 23: Empty state - No assigned reports
**Objective:** Verify the display when the officer has no assigned reports.

**Steps:**
1. Log in as an officer with no assigned reports.
2. Navigate to the Officer Page.

**Verify:**
- The page loads successfully.
- An info alert appears: "No reports found matching the selected filters."
- The counter shows "Showing 0 reports assigned to you".
- The filters are still available and functional.

---

## Test 24: Counter accuracy
**Objective:** Verify that the report counter is accurate in all scenarios.

**Steps:**
1. Load the page and note the counter.
2. Apply different filters and note the counter after each change.

**Verify:**
- Counter format is "Showing X report(s) assigned to you".
- Uses "report" (singular) when count is 1.
- Uses "reports" (plural) when count is not 1.
- Updates immediately when filters change.
- Always matches the number of visible report cards.

---

## Test 25: Date picker interaction
**Objective:** Verify that date pickers work correctly.

**Steps:**
1. Click on the "Start Date" picker.
2. Navigate through months using the calendar arrows.
3. Select a date.

**Verify:**
- Calendar opens correctly.
- Month/year navigation works.
- Date selection updates the filter immediately.
- Selected date appears in dd/MM/yyyy format.
- Calendar closes after date selection.
- Same behavior for "End Date" picker.

---

## Test 26: Filter persistence during navigation
**Objective:** Verify filter state when interacting with the page.

**Steps:**
1. Apply multiple filters.
2. Scroll down the page.
3. Open and close a report modal.

**Verify:**
- Filters remain applied throughout all interactions.
- Scroll position is maintained when modal closes.
- Filter dropdowns maintain their selected values.

---

## Test 27: Responsive layout - Desktop
**Objective:** Verify the layout on desktop screens.

**Steps:**
1. View the Officer Page on a desktop browser (1920x1080 or similar).

**Verify:**
- Filters are displayed horizontally in a single row.
- All filter controls are properly aligned.
- Report cards are readable and well-spaced.
- The map in report modals displays at a good size.

---

## Test 28: Responsive layout - Tablet
**Objective:** Verify the layout on tablet screens.

**Steps:**
1. Resize browser to tablet size (768px width) or use device emulation.

**Verify:**
- Filters may wrap to multiple rows if needed.
- All controls remain accessible.
- Report cards adjust to the available width.
- Modals adapt to the screen size.

---

## Test 29: Responsive layout - Mobile
**Objective:** Verify the layout on mobile screens.

**Steps:**
1. Resize browser to mobile size (375px width) or use device emulation.

**Verify:**
- Filters stack vertically.
- Date pickers and dropdowns remain usable.
- Report cards are displayed full-width.
- The modal becomes fullscreen (fullscreen="md-down").
- Map in modal remains interactive and readable.

---

## Test 30: Multiple officer roles
**Objective:** Verify that different officer roles see only their assigned reports.

**Steps:**
1. Log in as "Public Lighting Operator".
2. Note the displayed reports (e.g., categories related to public lighting).
3. Log out and log in as "Street Maintenance Operator".
4. Note the displayed reports (e.g., categories related to street maintenance).

**Verify:**
- Each officer sees only reports assigned to their role.
- Report categories match the officer's area of responsibility.
- The role header displays the correct role name for each user.

---

## Notes
- Officers have read-only access to reports - they can view but not modify or judge reports.
- The actual actions on reports (status changes, updates) are not managed in this interface.
- If action buttons appear in the modal, this indicates a configuration error (`isOfficerView` should be `true`).