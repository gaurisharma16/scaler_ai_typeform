# Typeform Clone — Improved Files

## File Mapping

| Improved file | Destination in your project |
|---|---|
| `SortableQuestion.tsx` | `frontend/components/builder/SortableQuestion.tsx` |
| `AddContentModal.tsx` | `frontend/components/builder/AddContentModal.tsx` |
| `ContentCanvas.tsx` | `frontend/components/builder/ContentCanvas.tsx` |
| `QuestionEditor.tsx` | `frontend/components/builder/QuestionEditor.tsx` |
| `UniversalModeSelect.tsx` | `frontend/components/builder/UniversalModeSelect.tsx` |
| `LivePreview.tsx` | `frontend/components/builder/LivePreview.tsx` |
| `edit-page.tsx` | `frontend/app/forms/[id]/edit/page.tsx` |
| `forms-page.tsx` | `frontend/app/forms/page.tsx` |
| `respondent-page.tsx` | `frontend/app/f/[slug]/page.tsx` |

## Key Improvements

### Drag-and-Drop (SortableQuestion.tsx + edit-page.tsx)
- **GripVertical icon** (6-dot grid) replaces the text `⠿` — appears on hover
- **DragOverlay** added to `edit-page.tsx` — shows a polished floating card
  while dragging instead of the empty slot that dnd-kit shows by default
- **KeyboardSensor** added so you can reorder with keyboard too
- **Active indicator**: a coloured left-border pill instead of a crude border
- The dragging item goes semi-transparent (opacity 0.4) so drop position is clear
- **Color-coded type badge** (uses QUESTION_META colors) in each list item

### AddContentModal (AddContentModal.tsx)
- Matches the Typeform screenshot exactly: 3-column grid for Contact info /
  Choice / Rating & ranking, plus Text & Video and Other columns beneath
- Search box that filters all items live
- Pro badge (purple diamond) on premium items instead of plain "Soon"
- Tabs: Add form elements / Import questions / Create with AI (latter two show
  "Coming soon" placeholder)
- Smooth close on backdrop click, close button with SVG X icon

### ContentCanvas (ContentCanvas.tsx)
- Auto-resizing `<textarea>` for the question title — grows as you type
- **Live preview updates in real-time as you type** (passes current title/desc
  to LivePreview without waiting for onBlur)
- Type pill badge shows the question type with its color
- Required badge shown in the canvas header
- Empty state with a nicer icon

### QuestionEditor (QuestionEditor.tsx)
- **Type selector is now a visual grid** — 8 colored buttons instead of a <select>
- Rating steps shown as clickable number buttons (3–10)
- Required is a polished toggle switch instead of a checkbox
- Choice options: press Enter to add the next one, Backspace on empty to remove

### UniversalModeSelect (UniversalModeSelect.tsx)
- Matches the Typeform screenshot: dropdown with icon + label + description
  for each mode
- SVG checkmark on active mode, Pro badge on locked modes
- Click-outside closes the dropdown

### LivePreview (LivePreview.tsx)
- Fully reactive to live edits in ContentCanvas
- Progress dots at the bottom for multi-question forms
- Pill-shaped "active" dot + wider dot indicator
- Better proportions and cleaner field previews

### Builder page (edit-page.tsx)
- DragOverlay hooked up
- Published status shows green dot
- Preview link appears in the toolbar when published
- Better loading spinner
- "Back" arrow in nav instead of text "Forms"
- Keyboard sensor for DnD

### Forms dashboard (forms-page.tsx)
- Color-coded form avatar in list rows
- `timeAgo` helper ("2h ago") instead of raw date
- Grid view has a "New typeform" placeholder card
- Better empty state with icon
- Icons in the context menu

### Respondent flow (respondent-page.tsx)
- **Required validation**: shows error if you skip a required question
- Animated error message (slides in with framer-motion)
- `setError(null)` cleared on every keystroke so errors disappear as soon as
  user types
- Animated welcome screen (slides in on mount)
- Keyboard hints use a <kbd> element
- Loading spinner on dark background instead of plain text
