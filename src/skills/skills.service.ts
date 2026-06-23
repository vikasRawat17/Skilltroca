import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async listGrouped() {
    const skills = await this.prisma.skill.findMany({
      where: { approved: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, category: true },
    });
    return skills.reduce<Record<string, { id: string; name: string }[]>>(
      (acc, s) => {
        const cat = s.category ?? 'Other';
        (acc[cat] ??= []).push({ id: s.id, name: s.name });
        return acc;
      },
      {},
    );
  }
}
