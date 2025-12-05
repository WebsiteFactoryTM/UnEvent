'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useState } from 'react'

interface AdminActionButtonProps {
  label: string
  endpoint: string
  method?: 'GET' | 'POST'
  confirmMessage?: string
  successMessage?: string
  errorMessage?: string
  description?: string
}

export const AdminActionButton: React.FC<AdminActionButtonProps> = ({
  label,
  endpoint,
  method = 'GET',
  confirmMessage,
  successMessage = 'Action completed successfully',
  errorMessage = 'Action failed',
  description,
}) => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const {
    config: { serverURL },
  } = useConfig()

  const handleAction = async () => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return
    }

    setLoading(true)
    setResult({ type: null, message: '' })

    try {
      const response = await fetch(`${serverURL}${endpoint}`, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || errorMessage)
      }

      setResult({
        type: 'success',
        message: data.message || successMessage,
      })
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={handleAction}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {loading ? 'Processing...' : label}
        </button>
        {description && <span style={{ fontSize: '13px', color: '#666' }}>{description}</span>}
      </div>
      {result.type && (
        <div
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '13px',
            backgroundColor: result.type === 'success' ? '#d4edda' : '#f8d7da',
            color: result.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${result.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {result.message}
        </div>
      )}
    </div>
  )
}
