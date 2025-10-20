#!/usr/bin/env node
import { spawn } from 'child_process'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Try multiple .env locations
const envPaths = [
  resolve(__dirname, '../../../.env'), // Project root
  resolve(__dirname, '../.env'), // Backend directory
  resolve(__dirname, '../../.env'), // Apps directory
]

let envLoaded = false
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    console.log('Loading .env from:', envPath)
    config({ path: envPath })
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  console.warn('No .env file found, using existing environment variables')
}

const DATABASE_URI = process.env.DATABASE_URI

if (!DATABASE_URI) {
  console.error('ERROR: DATABASE_URI not found in environment variables')
  console.error('Tried paths:', envPaths)
  process.exit(1)
}

const migrationFile = resolve(__dirname, '../postgress_migrations/001_add_custom_indexes.sql')

console.log('Running migration:', migrationFile)
console.log('Database:', DATABASE_URI.replace(/:([^:@]+)@/, ':****@')) // Hide password

const psql = spawn('psql', [DATABASE_URI, '-f', migrationFile], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URI },
})

psql.on('close', (code) => {
  if (code !== 0) {
    console.error(`Migration failed with exit code ${code}`)
    process.exit(code)
  }
  console.log('Migration completed successfully!')
})
