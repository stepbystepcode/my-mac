import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import type { Dirent } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
  timeout: 30000,
})

const prisma = new PrismaClient({ adapter })

const APP_ROOTS = ['/Applications', path.join(os.homedir(), 'Applications')]

type PlistRecord = Record<string, unknown>

const plistString = (plist: PlistRecord | null, key: string) => {
  if (!plist) return undefined
  const value = plist[key]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

const pickPlistString = (plist: PlistRecord | null, keys: string[]) => {
  for (const key of keys) {
    const value = plistString(plist, key)
    if (value) return value
  }
  return undefined
}

const readPlist = async (plistPath: string) => {
  try {
    const { stdout } = await execFileAsync('plutil', [
      '-convert',
      'json',
      '-o',
      '-',
      plistPath,
    ])
    const output = typeof stdout === 'string' ? stdout : stdout.toString('utf8')
    return JSON.parse(output) as PlistRecord
  } catch {
    return null
  }
}

const listAppBundles = async (root: string) => {
  const results: string[] = []

  const walk = async (dir: string) => {
    let entries: Dirent[]
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue
      if (!entry.isDirectory()) continue

      const fullPath = path.join(dir, entry.name)
      if (entry.name.endsWith('.app')) {
        results.push(fullPath)
        continue
      }

      await walk(fullPath)
    }
  }

  await walk(root)
  return results
}

const isSystemApp = (bundleId: string | undefined, appPath: string) => {
  if (appPath.startsWith('/System/')) return true
  if (!bundleId) return false
  return bundleId === 'com.apple' || bundleId.startsWith('com.apple.')
}

const readAppInfo = async (appPath: string) => {
  const plistPath = path.join(appPath, 'Contents', 'Info.plist')
  const plist = await readPlist(plistPath)
  if (!plist) return null

  const bundleId = plistString(plist, 'CFBundleIdentifier')
  if (isSystemApp(bundleId, appPath)) return null

  const name =
    pickPlistString(plist, ['CFBundleDisplayName', 'CFBundleName']) ||
    path.basename(appPath, '.app')

  const description =
    pickPlistString(plist, [
      'CFBundleGetInfoString',
      'NSHumanReadableCopyright',
    ]) ||
    bundleId ||
    `${name} app`

  return {
    name,
    description,
    url: pathToFileURL(appPath).toString(),
  }
}

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.app.deleteMany()

  if (process.platform !== 'darwin') {
    console.log('Skipping app discovery: this seed script expects macOS.')
    return
  }

  const seen = new Set<string>()
  const appPaths: string[] = []

  for (const root of APP_ROOTS) {
    try {
      const stat = await fs.stat(root)
      if (!stat.isDirectory()) continue
    } catch {
      continue
    }

    const bundles = await listAppBundles(root)
    for (const bundle of bundles) {
      if (seen.has(bundle)) continue
      seen.add(bundle)
      appPaths.push(bundle)
    }
  }

  const appData: Array<{
    name: string
    description: string
    icon: string
    url: string
  }> = []
  for (const appPath of appPaths) {
    const info = await readAppInfo(appPath)
    if (!info) continue

    appData.push({
      name: info.name,
      description: info.description,
      icon: '',
      url: info.url,
    })
  }

  if (appData.length === 0) {
    console.log('No non-system apps found to seed.')
    return
  }

  const apps = await prisma.app.createMany({
    data: appData,
  })

  console.log(`✅ Created ${apps.count} apps`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
