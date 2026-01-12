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

const EXCLUDED_BUNDLE_IDS = new Set<string>([
  'com.eagleyun.sase',
  'com.tal.yach.mac',
])

const EXCLUDED_BREW_FORMULAE = new Set<string>([
  // 'node',
])

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

const isRecord = (value: unknown): value is PlistRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

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

const plistObject = (plist: PlistRecord | null, key: string) => {
  if (!plist) return null
  const value = plist[key]
  return isRecord(value) ? value : null
}

const plistArray = (plist: PlistRecord | null, key: string) => {
  if (!plist) return null
  const value = plist[key]
  return Array.isArray(value) ? value : null
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

const resolveIconCandidates = (plist: PlistRecord | null) => {
  const candidates: string[] = []
  const iconFile = plistString(plist, 'CFBundleIconFile')
  if (iconFile) candidates.push(iconFile)

  const iconName = plistString(plist, 'CFBundleIconName')
  if (iconName) candidates.push(iconName)

  const icons = plistObject(plist, 'CFBundleIcons')
  const primary = plistObject(icons, 'CFBundlePrimaryIcon')
  const iconFiles = plistArray(primary, 'CFBundleIconFiles')
  if (iconFiles) {
    for (const value of iconFiles) {
      if (typeof value === 'string') candidates.push(value)
    }
  }
  const primaryName = plistString(primary, 'CFBundleIconName')
  if (primaryName) candidates.push(primaryName)

  return candidates
}

const resolveIcnsPath = async (appPath: string, plist: PlistRecord | null) => {
  const resourcesDir = path.join(appPath, 'Contents', 'Resources')
  const candidates = resolveIconCandidates(plist)
  const candidatePaths = candidates.flatMap((name) => {
    const hasIcns = name.toLowerCase().endsWith('.icns')
    const withExt = hasIcns ? [name] : [name, `${name}.icns`]
    return withExt.map((iconName) => path.join(resourcesDir, iconName))
  })

  for (const candidate of candidatePaths) {
    try {
      const stat = await fs.stat(candidate)
      if (stat.isFile()) return candidate
    } catch {
      continue
    }
  }

  try {
    const entries = await fs.readdir(resourcesDir, { withFileTypes: true })
    const icnsEntries = entries.filter(
      (entry) =>
        entry.isFile() && entry.name.toLowerCase().endsWith('.icns'),
    )

    if (icnsEntries.length === 0) return null

    const appIconEntry = icnsEntries.find((entry) =>
      entry.name.toLowerCase().includes('appicon'),
    )
    if (appIconEntry) return path.join(resourcesDir, appIconEntry.name)

    const bySize = await Promise.all(
      icnsEntries.map(async (entry) => {
        const fullPath = path.join(resourcesDir, entry.name)
        try {
          const stat = await fs.stat(fullPath)
          return { path: fullPath, size: stat.size }
        } catch {
          return { path: fullPath, size: 0 }
        }
      }),
    )
    bySize.sort((a, b) => b.size - a.size)
    return bySize[0]?.path ?? null
  } catch {
    return null
  }
}

const icnsToBase64 = async (icnsPath: string) => {
  let tempDir: string | null = null
  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'icns-'))
    const outputPath = path.join(tempDir, 'icon.png')
    await execFileAsync('sips', [
      '-s',
      'format',
      'png',
      '-s',
      'formatOptions',
      'best',
      '--resampleHeightWidthMax',
      '1024',
      icnsPath,
      '--out',
      outputPath,
    ])
    const data = await fs.readFile(outputPath)
    return `data:image/png;base64,${data.toString('base64')}`
  } catch {
    return ''
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true })
    }
  }
}

const iconCache = new Map<string, string>()

const getAppIcon = async (appPath: string, plist: PlistRecord | null) => {
  const iconPath = await resolveIcnsPath(appPath, plist)
  if (!iconPath) return ''
  const cached = iconCache.get(iconPath)
  if (cached) return cached
  const base64 = await icnsToBase64(iconPath)
  if (base64) iconCache.set(iconPath, base64)
  return base64
}

const readAppInfo = async (appPath: string) => {
  const plistPath = path.join(appPath, 'Contents', 'Info.plist')
  const plist = await readPlist(plistPath)
  if (!plist) return null

  const bundleId = plistString(plist, 'CFBundleIdentifier')
  if (bundleId && EXCLUDED_BUNDLE_IDS.has(bundleId)) return null
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

  const icon = await getAppIcon(appPath, plist)

  return {
    name,
    description,
    summary: description,
    icon,
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

const resolveBrewPath = async () => {
  const candidates = [
    process.env.HOMEBREW_BREW,
    process.env.BREW_BIN,
    '/opt/homebrew/bin/brew',
    '/usr/local/bin/brew',
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate)
      if (stat.isFile()) return candidate
    } catch {
      continue
    }
  }

  return 'brew'
}

const buildBrewEnv = () => {
  const fallbackPaths = ['/opt/homebrew/bin', '/usr/local/bin']
  const currentPath = process.env.PATH || ''
  const merged = [currentPath, ...fallbackPaths]
    .filter(Boolean)
    .join(':')
  return {
    ...process.env,
    HOMEBREW_NO_AUTO_UPDATE: process.env.HOMEBREW_NO_AUTO_UPDATE ?? '1',
    PATH: merged,
  }
}

type BrewFormula = {
  name?: string
  desc?: string | null
  homepage?: string | null
  tap?: string | null
  installed?: unknown[]
}

const loadBrewCliApps = async (): Promise<AppSeed[]> => {
  try {
    const brewPath = await resolveBrewPath()
    const { stdout } = await execFileAsync(
      brewPath,
      ['info', '--json=v2', '--installed'],
      { env: buildBrewEnv(), maxBuffer: 1024 * 1024 * 50 },
    )
    const output = typeof stdout === 'string' ? stdout : stdout.toString('utf8')
    const trimmed = output.trim()
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    const jsonPayload =
      start >= 0 && end >= 0 ? trimmed.slice(start, end + 1) : trimmed
    const data = JSON.parse(jsonPayload) as { formulae?: BrewFormula[] }
    const formulae = Array.isArray(data.formulae) ? data.formulae : []
    const curatedNames = new Set(cliApps.map((app) => app.name))

    return formulae
      .filter((formula) => Boolean(formula.name))
      .map((formula) => {
        const name = formula.name as string
        return {
          name,
          description: formula.desc || `${name} command-line tool.`,
          summary: formula.desc || `${name} command-line tool.`,
          details: formula.desc
            ? `${formula.desc} Installed via Homebrew.`
            : 'Installed via Homebrew.',
          icon: '',
          url:
            formula.homepage ||
            `https://formulae.brew.sh/formula/${encodeURIComponent(name)}`,
          kind: 'CLI' as const,
          category: formula.tap?.split('/').pop() || 'Homebrew',
          command: `brew install ${name}`,
        }
      })
      .filter((app) => !EXCLUDED_BREW_FORMULAE.has(app.name))
      .filter((app) => !curatedNames.has(app.name))
  } catch {
    return []
  }
}

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.app.deleteMany()

  const brewApps = await loadBrewCliApps()
  const appData: AppSeed[] = [...brewApps]

  if (process.env.SEED_INCLUDE_SAMPLE_CLI === 'true') {
    appData.push(...cliApps)
  }

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
        icon: info.icon,
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
