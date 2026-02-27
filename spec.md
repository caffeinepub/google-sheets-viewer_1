# Specification

## Summary
**Goal:** Fix the row hover highlight in SheetViewer so it is visible when tapping rows on mobile devices.

**Planned changes:**
- Replace or supplement the CSS `:hover`-only row highlight with a React state-driven touch/tap highlight using `onTouchStart`/`onTouchEnd` or `onClick` to toggle an active class on the tapped row
- The active/tapped state should apply the same colored left border stripe and background color change as the desktop hover effect
- Desktop hover behavior remains unchanged
- Zebra striping (alternating row shading) is preserved when rows are not highlighted

**User-visible outcome:** On mobile, tapping a data row in the SheetViewer table immediately shows the colored left border stripe and background highlight, matching the desktop hover experience.
