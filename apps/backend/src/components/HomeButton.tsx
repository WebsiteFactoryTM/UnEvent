import { Link, NavGroup } from '@payloadcms/ui'
import React from 'react'

export const HomeButton: React.FC = () => {
  return (
    <NavGroup label="Navigare Rapidă">
      <Link prefetch={false} href="/admin" className="nav__link" id="nav-home">
        <span className="nav__link-label">Acasă</span>
      </Link>
    </NavGroup>
  )
}
