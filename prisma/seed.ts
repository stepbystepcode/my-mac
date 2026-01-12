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

type AppKind = 'GUI' | 'CLI'

type AppSeed = {
  name: string
  description: string
  icon: string
  url: string
  kind: AppKind
  category: string
  summary: string
  details: string
  command?: string | null
}

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
    summary: description,
    url: pathToFileURL(appPath).toString(),
  }
}

const GUI_CATEGORY = 'Desktop'

const cliApps: AppSeed[] = [
  {
    name: 'ripgrep',
    description: 'Fast line-oriented search tool.',
    summary: 'Lightning-fast regex search for large codebases.',
    details:
      'ripgrep combines rip, grep, and ack features with incredible speed and sensible defaults for code search.',
    icon: '',
    url: 'https://github.com/BurntSushi/ripgrep',
    kind: 'CLI',
    category: 'Search',
    command: 'brew install ripgrep',
  },
  {
    name: 'fzf',
    description: 'Command-line fuzzy finder.',
    summary: 'Interactive fuzzy search for files, history, and commands.',
    details:
      'fzf adds fuzzy selection to your shell and tools, making it effortless to navigate large lists.',
    icon: '',
    url: 'https://github.com/junegunn/fzf',
    kind: 'CLI',
    category: 'Productivity',
    command: 'brew install fzf',
  },
  {
    name: 'bat',
    description: 'A cat clone with syntax highlighting.',
    summary: 'Readable file previews with themes and line numbers.',
    details:
      'bat improves on cat with syntax highlighting, git integration, and a sleek default theme.',
    icon: '',
    url: 'https://github.com/sharkdp/bat',
    kind: 'CLI',
    category: 'Utilities',
    command: 'brew install bat',
  },
  {
    name: 'fd',
    description: 'A simple, fast alternative to find.',
    summary: 'Fast file search with sensible defaults.',
    details:
      'fd offers a modern take on find with smart ignores, colorized output, and simple syntax.',
    icon: '',
    url: 'https://github.com/sharkdp/fd',
    kind: 'CLI',
    category: 'Utilities',
    command: 'brew install fd',
  },
  {
    name: 'jq',
    description: 'Command-line JSON processor.',
    summary: 'Slice, transform, and format JSON with ease.',
    details:
      'jq is a lightweight and flexible command-line JSON processor for filtering and transforming data.',
    icon: '',
    url: 'https://stedolan.github.io/jq/',
    kind: 'CLI',
    category: 'Data',
    command: 'brew install jq',
  },
  {
    name: 'gh',
    description: 'GitHub command-line interface.',
    summary: 'Work with GitHub pull requests, issues, and releases.',
    details:
      'gh brings GitHub to your terminal with streamlined workflows for PRs, reviews, and repo management.',
    icon: '',
    url: 'https://cli.github.com/',
    kind: 'CLI',
    category: 'Developer Tools',
    command: 'brew install gh',
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.app.deleteMany()

  const appData: AppSeed[] = [...cliApps]

  if (process.platform !== 'darwin') {
    console.log('Skipping app discovery: this seed script expects macOS.')
  } else {
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

    for (const appPath of appPaths) {
      const info = await readAppInfo(appPath)
      if (!info) continue

      appData.push({
        name: info.name,
        description: info.description,
        summary: info.summary,
        details: `${info.description} Indexed from your Applications folder for your local library.`,
        icon: '',
        url: info.url,
        kind: 'GUI',
        category: GUI_CATEGORY,
        command: null,
      })
    }
  }

  if (appData.length === 0) {
    console.log('No apps found to seed.')
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
