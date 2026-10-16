import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.dailyLog.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.segment.deleteMany()
  await prisma.setting.deleteMany()

  await prisma.setting.create({
    data: { key: 'streakTarget', value: '7' },
  })

  await prisma.segment.create({
    data: {
      name: 'Academic Mastery & Focus',
      order: 1,
      tasks: {
        create: [
          { title: 'Read 20 pages of non-fiction', order: 1 },
          { title: 'Complete daily coding challenge', order: 2 },
          { title: 'Deep work focus block (90 mins)', order: 3 },
        ],
      },
    },
  })

  await prisma.segment.create({
    data: {
      name: 'Physical Fitness & Health',
      order: 2,
      tasks: {
        create: [
          { title: 'Morning workout / Gym session', order: 1 },
          { title: 'Drink 3L of water', order: 2 },
          { title: '10,000 steps completed', order: 3 },
        ],
      },
    },
  })

  console.log('Database successfully seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })