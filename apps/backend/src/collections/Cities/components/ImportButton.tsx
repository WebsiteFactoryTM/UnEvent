'use client'

import React from 'react'

const ImportButton: React.FC = () => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <form
        action="/api/cities/import-csv"
        method="post"
        encType="multipart/form-data"
        style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
      >
        <input type="file" name="csv" accept=".csv" required />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Import Cities from CSV
        </button>
      </form>
    </div>
  )
}

export default ImportButton
