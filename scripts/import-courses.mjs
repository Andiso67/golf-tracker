import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const text = readFileSync(join(__dirname, '..', 'public', 'courses-es.json'), 'utf-8');
const data = JSON.parse(text);
const list = data.courses || [];

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

let imported = 0;
let errors = 0;

for (const item of list) {
  try {
    const name = item.n || item.name;
    const tees = (item.t || item.tees || []).map((t) => ({
      name: t.n || t.name || '',
      rating: t.r ?? t.rating ?? 0,
      slope: t.s ?? t.slope ?? 0,
      totalHoles: t.h ?? t.totalHoles ?? (t.p ? t.p.length : 18),
      pars: [...(t.p || t.pars || [])],
    }));

    if (tees.length === 0) continue;

    await prisma.course.create({
      data: {
        id: `rfeg_${item.id}`,
        name,
        tees: { create: tees.map((t) => ({ ...t })) },
      },
    });
    imported++;
  } catch (e) {
    errors++;
    if (errors <= 3) console.error('Error on', item.n || item.name, ':', e.message);
  }
}

console.log('Imported:', imported);
console.log('Errors:', errors);
await prisma.$disconnect();
