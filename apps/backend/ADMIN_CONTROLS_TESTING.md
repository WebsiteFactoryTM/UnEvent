# Admin Panel Controls - Testing Guide

## Overview
The admin panel now supports controlling schedulers and triggering maintenance tasks directly from the UI instead of relying solely on ENV variables and manual endpoint calls.

## What Was Implemented

### 1. Settings Global Enhancement
- Added **Enable Background Jobs** checkbox to control whether schedulers run
- Added **Scheduler Environment** dropdown to control interval multipliers
- Added **Admin Actions** tab with buttons to trigger maintenance tasks

### 2. Admin Actions Available
- **Regenerate Hub Data** - Triggers both city and listing type counter regeneration
- **Update City Counters** - Updates listing counts for all cities
- **Update Listing Type Counters** - Updates listing counts for all types

### 3. Initialization Changes
The `onInit` hook now reads from the Settings global with fallback to ENV variables:
- **Priority**: Settings Global → ENABLE_JOBS env var → default (false)
- **Scheduler Environment Priority**: Settings Global → SCHEDULER_ENV → NODE_ENV → default (dev)

## How to Test

### Setup
1. Start the backend server: `pnpm dev`
2. Login to the admin panel at `http://localhost:4000/admin`
3. Navigate to **Settings** → **Settings** in the sidebar

### Test 1: Enable/Disable Jobs
1. Check the **Enable Background Jobs** checkbox
2. Save the settings
3. Restart the server
4. Check the console logs - you should see:
   ```
   [Payload] Jobs control: enabled (source: Settings Global)
   [Payload] Initializing schedulers...
   ```
5. Uncheck the checkbox, save, and restart
6. Console should show:
   ```
   [Payload] Jobs control: disabled (source: Settings Global)
   [Payload] Schedulers disabled
   ```

### Test 2: Scheduler Environment
1. Select a different environment (e.g., "Production")
2. Save the settings
3. Restart the server
4. Check the logs for scheduler intervals - they should use the selected environment's multiplier

### Test 3: Admin Actions
1. Go to the **Admin Actions** tab in Settings
2. Click **Regenerate Hub Data**
3. Confirm the action in the dialog
4. Wait for the success message
5. Test the other action buttons similarly

### Test 4: Fallback Behavior
1. Remove all values from Settings (leave checkboxes unchecked)
2. Save and restart
3. The system should fall back to ENV variables
4. Console should show: `(source: ENV)`

## ENV Variable Fallbacks

If Settings are not configured, the system falls back to:
- `ENABLE_JOBS=true` - Enable schedulers
- `SCHEDULER_ENV=production|staging|dev` - Set environment multiplier

## Files Modified

1. `apps/backend/src/collections/Settings/index.ts` - Enhanced global config
2. `apps/backend/src/payload.config.ts` - Updated onInit hook
3. `apps/backend/src/utils/schedulerConfig.ts` - Added Settings support
4. `apps/backend/src/components/AdminActions/` - New UI components

## Benefits

✅ **No deployment needed** - Toggle schedulers without redeploying
✅ **Better visibility** - See current state in admin panel  
✅ **Audit trail** - Settings changes tracked via Payload's versioning
✅ **Safe defaults** - ENV vars still work for initial setup
✅ **One-click actions** - Trigger maintenance tasks without API calls

## Future Enhancements

Potential additions:
- Scheduler interval overrides (currently ENV-only)
- Email sending controls
- Feature flags for A/B testing
- Cache purge controls
- More granular scheduler control (enable/disable individual schedulers)
