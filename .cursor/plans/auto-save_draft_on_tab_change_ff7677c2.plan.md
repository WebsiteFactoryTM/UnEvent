---
name: Auto-save draft on tab change
overview: Implement automatic draft saving when users navigate between tabs in UnifiedListingForm, with safeguards to prevent breaking changes and ensure good UX.
todos: []
---

# Auto-save Draft on Tab Change

## Context Analysis

The `UnifiedListingForm` component currently requires manual draft saving via a button. Auto-saving on tab change will:

- Prevent data loss if users navigate away or close the browser
- Create listing ID early (beneficial for image uploads and other features)
- Improve UX by reducing manual save actions

**Key findings:**

- Draft saves bypass strict validation (schema.ts lines 402-456)
- Backend hooks (`notifyAdminNewListing`) only trigger for `pending` status, not drafts
- Image uploads work independently and don't require saved listing ID
- `savedListingId` state determines create vs update behavior
- React Query cache invalidation happens on every save (acceptable)
- `isSubmitting` currently blocks UI during saves

## Implementation Plan

### 1. Add Auto-save State Management

**File:** `apps/frontend/components/cont/listings/UnifiedListingForm.tsx`

- Add `isAutoSaving` state (separate from `isSubmitting` for manual saves)
- Add `lastSavedTab` state to track which tab was last saved
- Modify `handleSaveDraft` to accept optional `silent` parameter (default `false`)
- When `silent=true`, skip toast notifications
- Return early if already auto-saving to prevent race conditions

### 2. Update Tab Navigation Handlers

**File:** `apps/frontend/components/cont/listings/UnifiedListingForm.tsx`

- Modify `handleNext()` (lines 129-139):
- Check if current tab has unsaved changes (`lastSavedTab !== activeTab`)
- If unsaved, call `handleSaveDraft(true)` before changing tabs
- Make function async to await save completion
- Allow tab change even if save fails (don't block UX)

- Modify `Tabs` `onValueChange` handler (lines 433-437):
- Add same auto-save logic before tab change
- Handle both forward and backward navigation
- Ensure scroll behavior remains unchanged

### 3. Prevent Race Conditions

**File:** `apps/frontend/components/cont/listings/UnifiedListingForm.tsx`

- Add guard in `handleSaveDraft` to prevent concurrent saves:
- Check `isAutoSaving` flag before starting
- Set flag at start, clear in finally block
- Use same pattern for manual saves with `isSubmitting`

### 4. Handle Edge Cases

- **First tab navigation**: Auto-save on first tab change (info → address) to create listing early
- **Edit mode**: Auto-save still works but uses update instead of create
- **Error handling**: Log errors but don't show toast for silent saves
- **Network failures**: Allow navigation even if save fails (graceful degradation)
- **Rapid tab clicks**: Debouncing not needed since we track `lastSavedTab` and prevent concurrent saves

### 5. Button State Management

- Keep existing `isSubmitting` for manual "Salvează ca ciornă" button
- Don't disable tab navigation during auto-save (only disable during manual submission)
- Keep `isSubmitting` check for "Trimite spre aprobare" button (line 527)

## Breaking Changes Assessment

**No breaking changes expected:**

- Existing `handleSaveDraft` API remains unchanged (backward compatible with optional param)
- Form submission flow unchanged
- Backend hooks already handle drafts correctly
- React Query cache invalidation is idempotent
- Image uploads work independently

**Potential concerns (mitigated):**

- Increased API calls: Acceptable trade-off for data safety
- Cache invalidation frequency: Already happens on manual saves, no change in behavior
- Backend load: Draft saves are lightweight (no notifications, minimal processing)

## Testing Considerations

- Test rapid tab navigation (should prevent duplicate saves)
- Test save failure scenarios (navigation should still work)
- Test first-time create vs e