# Manual Testing Document: Maintainer Page

## Maintainer Page Test

### Purpose
Verify the dashboard for External Maintainers, ensuring they can view, filter, and manage their assigned maintenance tasks.

### Components involved
- Header (Work Orders title)
- Sidebar Filters (Status, Date Range, Sort)
- Task List (Report Cards)
- Maintainer Report Modal

### Test 1: View Task List
- Log in as an "External Maintainer".
- Navigate to `/maintainer`.
- **Verify that**:
  - The page loads without errors.
  - A list of assigned reports (tasks) is displayed.
  - The total count of tasks matches the number of items in the list.

### Test 2: Status Filtering
- In the sidebar, click the "Status" dropdown (default "All").
- Select "Assigned".
- **Verify that**:
  - The list updates to show *only* reports with "Assigned" status.
  - The counter at the top updates to reflect the filtered count.

### Test 3: Date Filtering
- Select a "Start Date" and "End Date" in the sidebar date pickers.
- **Verify that**:
  - The list filters reports created within that date range.

### Test 4: Sorting
- Change the "Sort by Date" dropdown from "Newest First" to "Oldest First".
- **Verify that**:
  - The order of reports in the list is reversed.

### Test 5: Reset Filters
- Apply a combination of status and date filters.
- Click the "Reset Filters" button.
- **Verify that**:
  - Status returns to "All".
  - Dates are cleared.
  - The full list of reports is displayed again.

### Test 6: Open Task Details
- Click on any report card in the list.
- **Verify that**:
  - The `MaintainerReportModal` opens.
  - It shows specific details relevant to the maintainer (Description, Status update options).

### Test 7: Status Update Workflows
**Objective:** Verify all status transitions available to the maintainer.

#### Flow A: Start Work
- **Pre-condition**: Report status is "Assigned" or "Delegated".
- Open the report modal.
- Click the "Start Work" button (Hammer icon).
- **Verify that**:
  - The "Update Successful!" screen appears with a green checkmark.
  - The message says "The report is now marked as **In Progress**".
  - Closing the modal updates the list: status badge is now "In Progress".

#### Flow B: Suspend Work
- **Pre-condition**: Report status is "In Progress".
- Open the report modal.
- Click the "Suspend" button (Pause icon).
- **Verify that**:
  - Success screen confirms status is "**Suspended**".
  - List badge updates to "Suspended".

#### Flow C: Resume Work
- **Pre-condition**: Report status is "Suspended".
- Open the report modal.
- Click the "Resume Work" button.
- **Verify that**:
  - Success screen confirms status is "**In Progress**".
  - List badge updates to "In Progress".

#### Flow D: Resolve Report
- **Pre-condition**: Report status is "In Progress".
- Open the report modal.
- Enter a "Maintenance Note" (e.g., "Filled the pothole").
- Click the "Mark as Resolved" button (Check icon).
- **Verify that**:
  - Success screen confirms status is "**Resolved**".
  - List badge updates to "Resolved".


### Test 8: Zero Results State
- Set filters to a date range in the far past (e.g., year 1990).
- **Verify that**:
  - The list is empty.
  - Examples of "No tasks found" message or icon are displayed.
