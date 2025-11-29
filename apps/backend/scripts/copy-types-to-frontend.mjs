import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backendTypesFile = path.resolve(__dirname, '../src/payload-types.ts')
const frontendTypesFile = path.resolve(__dirname, '../../frontend/types/payload-types.ts')

async function main() {
  try {
    // Read the backend types file
    const content = await readFile(backendTypesFile, 'utf8')

    // Find the line containing 'declare module'
    const lines = content.split('\n')
    const declareModuleIndex = lines.findIndex((line) => line.includes("declare module 'payload'"))

    if (declareModuleIndex === -1) {
      throw new Error("Could not find 'declare module' declaration in payload-types.ts")
    }

    // Copy everything before the declare module line
    const frontendContent = lines.slice(0, declareModuleIndex).join('\n')

    // Write to frontend types file
    await writeFile(frontendTypesFile, frontendContent + '\n', 'utf8')

    console.log(`✅ Copied types from ${path.relative(process.cwd(), backendTypesFile)}`)
    console.log(`   to ${path.relative(process.cwd(), frontendTypesFile)}`)
    console.log(`   (excluded ${lines.length - declareModuleIndex} lines with module declaration)`)
  } catch (err) {
    console.error('❌ Error copying types:', err.message)
    process.exit(1)
  }
}

main()
