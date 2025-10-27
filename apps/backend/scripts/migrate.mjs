#!/usr/bin/env node
import { spawn } from 'child_process'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync, readdirSync } from 'fs'

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

// Get all migration files from the migrations directory
const migrationsDir = resolve(__dirname, '../postgress_migrations')
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .map((file) => resolve(migrationsDir, file))
  .sort() // Sort alphabetically (001_, 002_, etc.)

if (migrationFiles.length === 0) {
  console.log('ℹ️  No migration files found')
  process.exit(0)
}

console.log(`Found ${migrationFiles.length} migration file(s):`)
migrationFiles.forEach((file) => console.log(`  - ${file.split('/').pop()}`))
console.log('Database:', DATABASE_URI.replace(/:([^:@]+)@/, ':****@')) // Hide password

// Function to run migrations sequentially
function runNextMigration(index = 0) {
  if (index >= migrationFiles.length) {
    console.log('🎉 All migrations completed successfully!')
    return
  }

  const migrationFile = migrationFiles[index]
  console.log(
    `\nRunning migration ${index + 1}/${migrationFiles.length}: ${migrationFile.split('/').pop()}`,
  )

  const psql = spawn('psql', [DATABASE_URI, '-f', migrationFile], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URI },
  })

  psql.on('close', (code) => {
    if (code !== 0) {
      console.error(`Migration ${index + 1} failed with exit code ${code}`)
      process.exit(code)
    }
    // Run next migration
    runNextMigration(index + 1)
  })
}

// Start running migrations
runNextMigration()
