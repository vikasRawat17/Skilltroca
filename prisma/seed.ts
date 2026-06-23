import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DB_STRING }),
});

// Canonical skill list. `category` is just a UI grouping label.
// Every `name` is unique — that uniqueness is what prevents the
// "express vs node both backend" fragmentation you wanted to avoid.
const SKILLS: { name: string; category: string }[] = [
  // Languages
  { name: 'JavaScript', category: 'Languages' },
  { name: 'TypeScript', category: 'Languages' },
  { name: 'Python', category: 'Languages' },
  { name: 'Java', category: 'Languages' },
  { name: 'Go', category: 'Languages' },
  { name: 'Rust', category: 'Languages' },
  { name: 'C++', category: 'Languages' },
  { name: 'C#', category: 'Languages' },
  { name: 'Kotlin', category: 'Languages' },
  { name: 'PHP', category: 'Languages' },
  { name: 'Ruby', category: 'Languages' },

  // Frontend
  { name: 'React', category: 'Frontend' },
  { name: 'Vue', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Svelte', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'HTML/CSS', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },

  // Backend
  { name: 'Node.js', category: 'Backend' },
  { name: 'NestJS', category: 'Backend' },
  { name: 'Express', category: 'Backend' },
  { name: 'Django', category: 'Backend' },
  { name: 'Flask', category: 'Backend' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'Ruby on Rails', category: 'Backend' },
  { name: 'Laravel', category: 'Backend' },
  { name: 'GraphQL', category: 'Backend' },

  // Mobile
  { name: 'React Native', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Swift', category: 'Mobile' },
  { name: 'Android', category: 'Mobile' },

  // Database
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MySQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Redis', category: 'Database' },
  { name: 'Prisma', category: 'Database' },

  // DevOps
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'AWS', category: 'DevOps' },
  { name: 'CI/CD', category: 'DevOps' },
  { name: 'Terraform', category: 'DevOps' },
  { name: 'Linux', category: 'DevOps' },

  // Data / ML
  { name: 'Machine Learning', category: 'Data' },
  { name: 'TensorFlow', category: 'Data' },
  { name: 'PyTorch', category: 'Data' },
  { name: 'Pandas', category: 'Data' },

  // Design
  { name: 'UI/UX Design', category: 'Design' },
  { name: 'Figma', category: 'Design' },
];

async function main() {
  for (const s of SKILLS) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category },
      create: { name: s.name, category: s.category, approved: true },
    });
  }
  console.log(`Seeded ${SKILLS.length} skills`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
