import { Button, Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './Layout.js'

export interface ResetPasswordEmailProps {
  user: {
    email: string
    displayName?: string | null
  }
  token: string
}

export function ResetPasswordEmail({ user, token }: ResetPasswordEmailProps) {
  const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
  const resetUrl = `${frontendUrl}/auth/resetare-parola?token=${token}`
  const firstName = user.displayName || user.email.split('@')[0] || ''
  const supportEmail = process.env.ADMIN_EMAIL || 'contact@unevent.ro'

  return (
    <EmailLayout preview="Resetează-ți parola pentru contul UN:EVENT">
      <Heading style={heading}>Resetează parola</Heading>

      <Text style={paragraph}>Salut, {firstName || 'acolo'}!</Text>

      <Text style={paragraph}>
        Ai solicitat resetarea parolei pentru contul tău UN:EVENT. Click pe butonul de mai jos
        pentru a crea o parolă nouă.
      </Text>

      <Section style={buttonContainer}>
        <Button href={resetUrl} style={button}>
          Resetează parola
        </Button>
      </Section>

      <Text style={paragraphSmall}>
        Acest link este valabil pentru 24 de ore. Dacă nu ai solicitat resetarea parolei, poți
        ignora acest email sau ne poți scrie la {supportEmail}.
      </Text>

      <Text style={signature}>— Echipa UN:EVENT</Text>
    </EmailLayout>
  )
}

const heading = {
  color: '#000000',
  fontSize: '22px',
  fontWeight: 600,
  lineHeight: '28px',
  margin: '0 0 20px',
}

const paragraph = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const paragraphSmall = {
  color: '#4b4b4b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px',
}

const buttonContainer = {
  padding: '20px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const signature = {
  color: '#000000',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
}
