import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.app.deleteMany()

  const apps = await prisma.app.createMany({
    data: [
      {
        name: 'Arc Browser',
        description: 'The Chrome replacement you’ve been waiting for.',
        icon: 'https://arc.net/favicon.ico',
        version: '1.24.0',
        size: '350 MB',
        status: 'Installed',
      },
      {
        name: 'Visual Studio Code',
        description: 'Code editing. Redefined.',
        icon: 'https://code.visualstudio.com/favicon.ico',
        version: '1.86.0',
        size: '480 MB',
        status: 'Installed',
      },
      {
        name: 'Raycast',
        description: 'Supercharged productivity tool.',
        icon: 'https://www.raycast.com/favicon.ico',
        version: '1.67.0',
        size: '120 MB',
        status: 'Updated',
      },
      {
        name: 'Figma',
        description: 'The collaborative interface design tool.',
        icon: 'https://static.figma.com/app/icon/1/icon-512.png',
        version: '116.15.4',
        size: '210 MB',
        status: 'Installed',
      },
      {
        name: 'Notion',
        description: 'Your connected workspace for wiki, docs & projects.',
        icon: 'https://www.notion.so/images/favicon.ico',
        version: '2.32.0',
        size: '180 MB',
        status: 'Installed',
      },
      {
        name: 'Slack',
        description: 'Team communication for the 21st century.',
        icon: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png',
        version: '4.36.1',
        size: '250 MB',
        status: 'Update Available',
      },
      {
        name: 'Docker Desktop',
        description: 'Containerize your applications.',
        icon: 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png',
        version: '4.27.0',
        size: '1.2 GB',
        status: 'Installed',
      },
      {
        name: 'iTerm2',
        description: 'macOS Terminal Replacement.',
        icon: 'https://iterm2.com/favicon.ico',
        version: '3.4.23',
        size: '45 MB',
        status: 'Installed',
      },
       {
        name: 'Spotify',
        description: 'Music for everyone.',
        icon: 'https://www.scdn.co/i/_global/favicon.png',
        version: '1.2.30',
        size: '290 MB',
        status: 'Installed',
      },
      {
        name: 'Linear',
        description: 'Issue tracking built for speed.',
        icon: 'https://linear.app/favicon.ico',
        version: '1.14.0',
        size: '140 MB',
        status: 'Installed',
      }
    ],
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
