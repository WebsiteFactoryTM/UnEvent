'use client'

import React from 'react'
import { AdminActionButton } from './AdminActionButton'

export const AdminActionsPanel: React.FC = () => {
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: 600 }}>Admin Actions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AdminActionButton
          label="Regenerate Hub Data"
          endpoint="/api/regenerate-hub"
          method="GET"
          description="Regenerate Hub data"
          confirmMessage="Are you sure you want to regenerate hub data? This may take a few moments."
          successMessage="Hub data regenerated successfully"
        />
        <AdminActionButton
          label="Update City Counters"
          endpoint="/api/update-city-counters"
          method="POST"
          description="Update usage counts for all cities"
          confirmMessage="Are you sure you want to update city counters?"
          successMessage="City counters updated successfully"
        />
        <AdminActionButton
          label="Update Listing Type Counters"
          endpoint="/api/update-listing-type-counters"
          method="POST"
          description="Update usage counts for all types"
          confirmMessage="Are you sure you want to update listing type counters?"
          successMessage="Listing type counters updated successfully"
        />
      </div>
    </div>
  )
}
