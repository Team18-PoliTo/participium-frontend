# Manual Testing Document: Report Description Modal

## Report Description Modal Test

### Purpose
Verify that the Public Relations Officer can view report details, approve, or reject reports with proper validation and feedback.

### Components involved
- Report details display
- Interactive map
- Category dropdown
- Photo gallery
- Photo preview modal
- Approve/Reject toggle
- Explanation textarea
- Confirm and Cancel buttons

### Test 1: Open modal with valid report
- Click on a report card from the dashboard.
- Verify that:
  - The modal opens and displays the report title.
  - All report fields are populated correctly (title, description, address, date).
  - The map shows the correct location with a marker.
  - The category is pre-selected in the dropdown.
  - Photos are displayed if available.

### Test 2: View report details
- Open a report modal.
- Verify that:
  - Title is displayed correctly.
  - Description is displayed correctly.
  - Address shows with a map pin icon.
  - Creation date is formatted as "Month Day, Year, HH:MM AM/PM".
  - Map is centered on the report location at zoom level 16.
  - Map interactions (scroll, drag, zoom) are disabled.

### Test 3: Change category
- In the modal, click the category dropdown.
- Select a different category.
- Verify that:
  - The dropdown shows the new category with its icon.
  - The selected category is highlighted in the dropdown menu.

### Test 4: View photos
- Open a report with photos.
- Verify that:
  - All photos are displayed in a grid (max 3 per row on desktop).
  - Photos are clickable.
  - Clicking a photo opens the full-size preview modal.

### Test 5: Photo preview modal
- Click on a photo thumbnail.
- Verify that:
  - The photo preview modal opens.
  - The full-size photo is displayed on a dark background.
  - The modal has a close button.
  - Clicking the close button returns to the report modal.

### Test 6: Approve action (default)
- Open a report modal.
- Verify that:
  - "Approve" toggle button is active by default.
  - The explanation textarea is disabled.
  - The textarea shows placeholder "No explanation required".
  - The confirm button is green and shows "Approve Report" with a check icon.

### Test 7: Switch to reject action
- Click the "Reject" toggle button.
- Verify that:
  - The "Reject" button becomes active (highlighted).
  - The "Approve" button becomes inactive.
  - The explanation textarea becomes enabled and editable.
  - The textarea placeholder changes to "Enter your explanation here...".
  - The confirm button becomes red and shows "Reject Report" with an X icon.

### Test 8: Switch back to approve
- Switch to reject mode, then click "Approve" again.
- Verify that:
  - The approve mode is activated.
  - The explanation textarea is disabled and cleared.
  - The button styling returns to green with check icon.

### Test 9: Approve a report
- Select a category if needed.
- Ensure "Approve" is selected.
- Click "Approve Report".
- Verify that:
  - The report is approved successfully.
  - The modal closes.
  - The report disappears from the dashboard.
  - No error message appears.

### Test 10: Reject a report with explanation
- Switch to "Reject" mode.
- Enter an explanation in the textarea.
- Select a category if needed.
- Click "Reject Report".
- Verify that:
  - The report is rejected successfully.
  - The modal closes.
  - The report disappears from the dashboard.
  - No error message appears.

### Test 11: Reject without explanation (validation)
- Switch to "Reject" mode.
- Leave the explanation textarea empty.
- Click "Reject Report".
- Verify that:
  - The browser shows an HTML5 validation message (required field).
  - The form is not submitted.
  - The modal remains open.

### Test 12: Error handling on approval
- Simulate a network error (disconnect or mock API failure).
- Try to approve a report.
- Verify that:
  - An error alert appears in the modal.
  - The error message is displayed: "Failed to approve the report. Please try again."
  - The alert is dismissible.
  - The modal remains open.
  - The user can retry the action.

### Test 13: Error handling on rejection
- Simulate a network error.
- Try to reject a report.
- Verify that:
  - An error alert appears: "Failed to reject the report. Please try again."
  - The modal remains open with the explanation preserved.

### Test 14: Close modal with Cancel button
- Make changes in the modal (change category, enter explanation).
- Click "Cancel".
- Verify that:
  - The modal closes.
  - No changes are saved.
  - The report remains in the dashboard.

### Test 15: Close modal with X button
- Open the modal.
- Click the X button in the header.
- Verify that:
  - The modal closes.
  - The behavior is the same as clicking "Cancel".

### Test 16: Modal state reset on close
- Open a report, make changes (category, reject mode, explanation).
- Close the modal.
- Reopen the same report.
- Verify that:
  - The category is reset to the original.
  - The mode is reset to "Approve".
  - The explanation is cleared.
  - No error messages are displayed.

### Test 17: Map functionality
- Open a report with location.
- Verify that:
  - The map loads correctly with OpenStreetMap tiles.
  - The marker is positioned at the correct coordinates.
  - Attribution is visible at the bottom.
  - Scroll, drag, and zoom are disabled (read-only map).

### Test 18: Reports without photos
- Open a report that has no photos.
- Verify that:
  - The "Included Photos" section shows "No photos included".
  - No photo grid is displayed.
  - The modal displays correctly without layout issues.

### Test 19: Reports without location
- Open a report without location data.
- Verify that:
  - The map section is not displayed.
  - The address shows "Address not available".
  - Other sections display correctly.

### Test 20: Dismiss error alert
- Trigger an error (e.g., network failure).
- Click the X button on the error alert.
- Verify that:
  - The alert disappears.
  - The modal remains open.
  - The user can continue interacting with the modal.

### Test 21: Mobile responsiveness
- Open the modal on a mobile device or narrow browser window.
- Verify that:
  - The modal goes fullscreen on mobile (<md breakpoint).
  - All elements remain accessible and readable.
  - Photos stack vertically in a single column.
  - Buttons and dropdowns are touch-friendly.