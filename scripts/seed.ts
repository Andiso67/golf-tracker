import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) })

async function main() {
  if (!process.argv.includes('--force')) {
    console.log('WARNING: This will DELETE ALL EXISTING DATA.')
    console.log('Run with --force to proceed: npx tsx scripts/seed.ts --force')
    await prisma.$disconnect()
    process.exit(0)
  }

  console.log('Seeding database...')

  // Clean existing data in reverse dependency order
  await prisma.handicapEntry.deleteMany()
  await prisma.hole.deleteMany()
  await prisma.round.deleteMany()
  await prisma.tee.deleteMany()
  await prisma.course.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.player.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create User
  const passwordHash = await bcrypt.hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash,
      firstName: 'Carlos',
      lastName1: 'García',
      lastName2: 'López',
      role: 'user',
      emailVerified: new Date(),
      sessionToken: 'test-session-token-abc123',
    },
  })
  console.log(`  ✓ User: ${user.email} (password: password123)`)

  // 2. Create Player
  const player = await prisma.player.create({
    data: {
      email: 'test@example.com',
      firstName: 'Carlos',
      lastName1: 'García',
      lastName2: 'López',
      handicap: 14.2,
      homeCourse: 'Valdeláguila Golf',
      licenseNumber: '12345678',
    },
  })
  console.log(`  ✓ Player: ${player.firstName} ${player.lastName1} (hcp ${player.handicap})`)

  // 3. Create Course with Tees
  const pars18 = [4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4]
  const course = await prisma.course.create({
    data: {
      id: 'seed_course_001',
      name: 'Valdeláguila Golf',
      tees: {
        create: [
          { name: 'Blanco', rating: 72.1, slope: 135, totalHoles: 18, pars: pars18 },
          { name: 'Amarillo', rating: 70.5, slope: 130, totalHoles: 18, pars: pars18 },
          { name: 'Azul', rating: 68.9, slope: 125, totalHoles: 18, pars: pars18 },
          { name: 'Rojo', rating: 66.2, slope: 118, totalHoles: 18, pars: pars18 },
        ],
      },
    },
  })
  console.log(`  ✓ Course: ${course.name}`)

  // 4. Create completed rounds with hole data
  const rounds = [
    {
      date: new Date('2026-06-15'),
      scores: [4, 5, 5, 3, 5, 4, 4, 6, 5, 4, 3, 5, 5, 4, 4, 5, 5, 4],
    },
    {
      date: new Date('2026-06-22'),
      scores: [5, 4, 6, 4, 4, 5, 3, 5, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5],
    },
    {
      date: new Date('2026-06-29'),
      scores: [4, 3, 5, 3, 4, 4, 2, 5, 4, 4, 2, 5, 4, 3, 4, 5, 3, 4],
    },
  ]

  for (let i = 0; i < rounds.length; i++) {
    const r = rounds[i]
    const roundId = `seed_round_completed_${i + 1}`
    const totalScore = r.scores.reduce((a, b) => a + b, 0)
    const scoreToPar = totalScore - pars18.reduce((a, b) => a + b, 0)

    await prisma.round.create({
      data: {
        id: roundId,
        playerId: player.id,
        courseId: course.id,
        courseName: course.name,
        teeColor: 'Amarillo',
        gameMode: 'stroke-play',
        date: r.date,
        totalHoles: 18,
        completed: true,
        holes: {
          create: r.scores.map((score, idx) => {
            const p = score <= pars18[idx] ? Math.max(1, Math.round(pars18[idx] / 3)) : 2;
            return {
            number: idx + 1,
            par: pars18[idx],
            score,
            fairwayHit: score <= pars18[idx] ? 'Yes' : idx % 3 === 0 ? 'Left' : 'Right',
            gir: score - p <= pars18[idx] - 2,
            putts: p,
            puttDistance: score <= pars18[idx] ? 'R_1_2' : 'R_2_4',
            penalties: score > pars18[idx] + 1 ? 1 : 0,
            sandSave: 0,
            approach: 0,
          };
          }),
        },
      },
    })
    console.log(`  ✓ Round ${i + 1}: ${totalScore} (+${scoreToPar}) on ${r.date.toLocaleDateString()}`)

    // Add handicap entry
    const newHandicap = Math.round((scoreToPar * 0.96) * 10) / 10
    await prisma.handicapEntry.create({
      data: {
        playerId: player.id,
        date: r.date,
        handicap: player.handicap + newHandicap * 0.1,
      },
    })
  }

  // 5. Create active (in-progress) round
  const activeRoundId = 'seed_round_active_1'
  const activeScores = [4, 5, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  await prisma.round.create({
    data: {
      id: activeRoundId,
      playerId: player.id,
      courseId: course.id,
      courseName: course.name,
      teeColor: 'Blanco',
      gameMode: 'stableford',
      date: new Date(),
      totalHoles: 18,
      completed: false,
      holes: {
        create: activeScores.map((score, idx) => {
          const p = score > 0 ? Math.max(1, Math.round(pars18[idx] / 3)) : 0;
          return {
          number: idx + 1,
          par: pars18[idx],
          score,
          fairwayHit: score > 0 ? (score <= pars18[idx] ? 'Yes' : 'Right') : null,
          gir: score > 0 ? score - p <= pars18[idx] - 2 : null,
          putts: p,
          puttDistance: score > 0 ? 'R_1_2' : null,
          penalties: score > pars18[idx] + 1 ? 1 : 0,
          sandSave: 0,
          approach: 0,
          };
        }),
      },
    },
  })
  console.log(`  ✓ Active round: in progress (4 holes played)`)

  console.log('\n--- Seed complete ---')
  console.log('Login with: test@example.com / password123')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
