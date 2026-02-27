# Specification

## Summary
**Goal:** Hide the 6th column (index 5) from the SheetViewer table so it is never rendered in the UI.

**Planned changes:**
- Skip rendering the `<th>` header cell for column index 5 in the SheetViewer table header row
- Skip rendering any `<td>` data cell for column index 5 in all table data rows
- Update the column count summary in the page header to reflect the number of displayed columns (total minus 1 hidden)

**User-visible outcome:** The SheetViewer table no longer shows the 6th column in either the header or any data row; all other columns and the table layout remain unchanged.
