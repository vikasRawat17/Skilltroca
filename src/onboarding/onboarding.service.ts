import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SkillKind } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { MatchService } from 'src/match/match.service';

const uniq = (xs: string[]) => [...new Set(xs)];

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly match: MatchService,
  ) {}

  async complete(userId: string, dto: OnboardingDto) {
    // gate: must be a verified user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException();
    if (!user.emailVerified)
      throw new ForbiddenException('Verify your email first');

    // 1. Turn "other" free-text into approved:false Skill rows (dedup, case-insensitive)
    const offerIds = uniq([
      ...dto.offers,
      ...(await this.resolveCustom(dto.customOffers)),
    ]);
    const seekIds = uniq([
      ...dto.seeks,
      ...(await this.resolveCustom(dto.customSeeks)),
    ]);

    // 2. Never trust the FE: every id must exist
    const allIds = uniq([...offerIds, ...seekIds]);
    const found = await this.prisma.skill.findMany({
      where: { id: { in: allIds } },
      select: { id: true },
    });
    if (found.length !== allIds.length)
      throw new BadRequestException('Unknown skill id');

    // 3. Can't offer and seek the same skill
    if (offerIds.some((id) => seekIds.includes(id)))
      throw new BadRequestException(
        'A skill cannot be both offered and sought',
      );

    // 4. Replace skills + flip flag atomically (idempotent re-submit)
    await this.prisma.$transaction([
      this.prisma.userSkill.deleteMany({ where: { userId } }),
      this.prisma.userSkill.createMany({
        data: [
          ...offerIds.map((skillId) => ({
            userId,
            skillId,
            kind: SkillKind.OFFER,
          })),
          ...seekIds.map((skillId) => ({
            userId,
            skillId,
            kind: SkillKind.SEEK,
          })),
        ],
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { onBoarding: true },
      }),
    ]);

    // 5. fire the match engine on committed data (best-effort; re-runnable)
    await this.match.runForUser(userId);
    return { offers: offerIds.length, seeks: seekIds.length };
  }

  private async resolveCustom(names?: string[]): Promise<string[]> {
    if (!names?.length) return [];
    const ids: string[] = [];
    for (const raw of names) {
      const name = raw.trim();
      if (!name) continue;
      // reuse a canonical skill if the typed name matches one (case-insensitive)
      const existing = await this.prisma.skill.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { id: true },
      });
      if (existing) {
        ids.push(existing.id);
        continue;
      }
      const created = await this.prisma.skill.create({
        data: { name, category: 'Other', approved: false },
      });
      ids.push(created.id);
    }
    return ids;
  }
}
