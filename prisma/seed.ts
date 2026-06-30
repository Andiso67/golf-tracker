import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

const SALT_ROUNDS = 10
const PASSWORD = 'test1234'

const USERS = [
  { firstName: 'Ana', lastName1: 'García', lastName2: 'López', email: 'ana@test.com' },
  { firstName: 'Carlos', lastName1: 'Martínez', lastName2: 'Ruiz', email: 'carlos@test.com' },
  { firstName: 'Elena', lastName1: 'Sánchez', lastName2: 'Díaz', email: 'elena@test.com' },
  { firstName: 'Miguel', lastName1: 'Torres', lastName2: 'Pérez', email: 'miguel@test.com' },
  { firstName: 'Laura', lastName1: 'Ramírez', lastName2: 'Moreno', email: 'laura@test.com' },
]

const PLAYER_DATA = [
  { firstName: 'Ana', lastName1: 'García', lastName2: 'López', handicap: 12.4, homeCourse: 'Club de Campo Villa de Madrid', licenseNumber: '28234567', email: 'ana@test.com' },
  { firstName: 'Carlos', lastName1: 'Martínez', lastName2: 'Ruiz', handicap: 8.2, homeCourse: 'Real Club de Golf La Herrería', licenseNumber: '28123456', email: 'carlos@test.com' },
  { firstName: 'Elena', lastName1: 'Sánchez', lastName2: 'Díaz', handicap: 18.7, homeCourse: 'Golf Sant Cugat', licenseNumber: '08456789', email: 'elena@test.com' },
  { firstName: 'Miguel', lastName1: 'Torres', lastName2: 'Pérez', handicap: 5.1, homeCourse: 'Real Golf Club de Pedreña', licenseNumber: '39678901', email: 'miguel@test.com' },
  { firstName: 'Laura', lastName1: 'Ramírez', lastName2: 'Moreno', handicap: 21.3, homeCourse: 'Golf Son Servera', licenseNumber: '07901234', email: 'laura@test.com' },
]

const COURSES = [
  { name: 'Club de Campo Villa de Madrid', tees: [{ name: 'Blanco', rating: 73.2, slope: 138, totalHoles: 18, pars: [4,5,4,3,5,4,3,4,4, 4,5,3,4,4,5,3,4,4] }] },
  { name: 'Real Club de Golf La Herrería', tees: [{ name: 'Amarillo', rating: 70.8, slope: 132, totalHoles: 18, pars: [4,4,5,3,4,4,5,3,4, 4,4,3,5,4,4,3,5,4] }] },
]

async function main() {
  console.log('🧹 Cleaning database...')
  await prisma.hole.deleteMany()
  await prisma.round.deleteMany()
  await prisma.handicapEntry.deleteMany()
  await prisma.tee.deleteMany()
  await prisma.course.deleteMany()
  await prisma.player.deleteMany()
  await prisma.user.deleteMany()
  await prisma.verificationToken.deleteMany()

  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS)

  // Create users
  const users = await Promise.all(
    USERS.map((u) =>
      prisma.user.create({
        data: { ...u, passwordHash, emailVerified: new Date() },
      })
    )
  )
  console.log(`✅ ${users.length} users created`)

  // Create players
  const players = await Promise.all(
    PLAYER_DATA.map((p) =>
      prisma.player.create({ data: p })
    )
  )
  console.log(`✅ ${players.length} players created`)

  // Create courses with tees
  const courses = await Promise.all(
    COURSES.map((c) =>
      prisma.course.create({
        data: {
          name: c.name,
          tees: { create: c.tees },
        },
        include: { tees: true },
      })
    )
  )
  console.log(`✅ ${courses.length} courses created`)

  // Create rounds: 2 stroke-play for Ana, 1 stableford for Carlos, 1 multi-player
  const now = new Date()
  const dayMs = 86400000

  // Round 1: Ana stroke-play at La Herrería (completed)
  const round1 = await prisma.round.create({
    data: {
      playerId: players[0].id,
      courseId: courses[1].id,
      courseName: courses[1].name,
      teeColor: courses[1].tees[0].name,
      gameMode: 'stroke-play',
      date: new Date(now.getTime() - dayMs * 3),
      totalHoles: 18,
      completed: true,
      holes: {
        create: courses[1].tees[0].pars.map((par, i) => ({
          number: i + 1,
          par,
          score: par + (i % 3 === 0 ? 1 : i % 3 === 1 ? 0 : -1),
          fairwayHit: i % 4 === 0 ? 'Yes' : i % 4 === 1 ? 'Left' : i % 4 === 2 ? 'Right' : 'Yes',
          gir: i % 2 === 0,
          putts: i % 3 + 1,
          penalties: i === 8 || i === 17 ? 1 : 0,
        })),
      },
    },
    include: { holes: true },
  })
  console.log(`✅ Round 1 created (${round1.holes.length} holes, stroke-play, Ana)`)

  // Round 2: Ana stroke-play at Club de Campo (incomplete)
  await prisma.round.create({
    data: {
      playerId: players[0].id,
      courseId: courses[0].id,
      courseName: courses[0].name,
      teeColor: courses[0].tees[0].name,
      gameMode: 'stroke-play',
      date: new Date(now.getTime() - dayMs * 1),
      totalHoles: 18,
      completed: false,
      holes: {
        create: courses[0].tees[0].pars.slice(0, 9).map((par, i) => ({
          number: i + 1,
          par,
          score: par + 1,
          fairwayHit: 'Yes',
          gir: false,
          putts: 2,
        })),
      },
    },
  })
  console.log('✅ Round 2 created (9 holes, stroke-play, Ana, in progress)')

  // Round 3: Carlos stableford at La Herrería (completed)
  const round3 = await prisma.round.create({
    data: {
      playerId: players[1].id,
      courseId: courses[1].id,
      courseName: courses[1].name,
      teeColor: courses[1].tees[0].name,
      gameMode: 'stableford',
      date: new Date(now.getTime() - dayMs * 5),
      totalHoles: 18,
      completed: true,
      holes: {
        create: courses[1].tees[0].pars.map((par, i) => ({
          number: i + 1,
          par,
          score: Math.max(1, par + (i % 4 === 0 ? -1 : i % 4 === 2 ? 2 : 0)),
          fairwayHit: i < 14 ? 'Yes' : 'Right',
          gir: i < 12,
          putts: i % 2 + 1,
          penalties: 0,
        })),
      },
    },
    include: { holes: true },
  })
  console.log(`✅ Round 3 created (${round3.holes.length} holes, stableford, Carlos)`)

  // Round 4: Multi-player stableford at Club de Campo (Ana, Carlos, Elena, Miguel)
  const round4 = await prisma.round.create({
    data: {
      playerId: players[0].id,
      courseId: courses[0].id,
      courseName: courses[0].name,
      teeColor: courses[0].tees[0].name,
      gameMode: 'stableford',
      date: new Date(now.getTime() - dayMs * 7),
      totalHoles: 18,
      completed: true,
      holes: {
        create: courses[0].tees[0].pars.map((par, i) => ({
          number: i + 1,
          par,
          score: par + (i % 3 === 0 ? 1 : i % 3 === 1 ? -1 : 0),
          fairwayHit: 'Yes',
          gir: i % 3 !== 2,
          putts: i % 3 + 1,
        })),
      },
    },
  })

  // Add same round for Carlos, Elena, Miguel (same course, different scores)
  const scoresMap = [
    courses[0].tees[0].pars.map((par, i) => par + (i % 2 === 0 ? 2 : -1)), // Carlos
    courses[0].tees[0].pars.map((par, i) => par + (i % 5 === 0 ? 3 : i % 5 === 2 ? 1 : 0)), // Elena
    courses[0].tees[0].pars.map((par, i) => par + (i % 3 === 0 ? -2 : i % 3 === 1 ? 1 : 0)), // Miguel
  ]
  const otherPlayers = [players[1], players[2], players[3]]

  for (let p = 0; p < otherPlayers.length; p++) {
    await prisma.round.create({
      data: {
        playerId: otherPlayers[p].id,
        courseId: courses[0].id,
        courseName: courses[0].name,
        teeColor: courses[0].tees[0].name,
        gameMode: 'stableford',
        date: new Date(now.getTime() - dayMs * 7),
        totalHoles: 18,
        completed: true,
        holes: {
          create: scoresMap[p].map((score, i) => ({
            number: i + 1,
            par: courses[0].tees[0].pars[i],
            score,
            fairwayHit: 'Yes',
            gir: score <= courses[0].tees[0].pars[i],
            putts: 2,
          })),
        },
      },
    })
  }

  console.log('✅ Round 4+ created (multi-player stableford, Club de Campo)')

  // Handicap history entries
  for (const player of players) {
    const entries = [
      { date: new Date(now.getTime() - dayMs * 30), handicap: player.handicap + 2.1 },
      { date: new Date(now.getTime() - dayMs * 15), handicap: player.handicap + 0.8 },
      { date: now, handicap: player.handicap },
    ]
    await prisma.handicapEntry.createMany({
      data: entries.map((e) => ({ ...e, playerId: player.id })),
    })
  }
  console.log('✅ Handicap history created')

  console.log('\n🎉 Seed complete!')
  console.log('   Password for all users:', PASSWORD)
  console.log('   Emails:', USERS.map((u) => u.email).join(', '))
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
