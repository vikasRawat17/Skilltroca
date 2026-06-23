import { Injectable, Logger } from '@nestjs/common';
import { SkillKind, MatchStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUniqueViolation } from 'src/utils/helpers/match/match.helpers';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);
  constructor(private readonly prisma: PrismaService) {}

  async runForUser(userId: string): Promise<void> {
    const skills = await this.prisma.userSkill.findMany({
      where: { userId },
      select: { skillId: true, kind: true },
    });
    const myOfferIds = skills
      .filter((s) => s.kind === SkillKind.OFFER)
      .map((s) => s.skillId);
    const mySeekIds = skills
      .filter((s) => s.kind === SkillKind.SEEK)
      .map((s) => s.skillId);
    for (const skillId of mySeekIds) {
      await this.matchSeekerToOfferer(userId, skillId, myOfferIds);
    }
    for (const skillId of myOfferIds) {
      await this.rescueWaitingSeekers(userId, skillId);
    }
  }

  private async matchSeekerToOfferer(
    seekerId: string,
    skillId: string,
    seekerOfferIds: string[],
  ): Promise<void> {
    const already = await this.prisma.match.findFirst({
      where: { seekerId, skillId, status: MatchStatus.ACTIVE },
      select: { id: true },
    });
    if (already) return;

    let offerer = seekerOfferIds.length
      ? await this.prisma.userSkill.findFirst({
          where: {
            skillId,
            kind: SkillKind.OFFER,
            userId: { not: seekerId },
            user: {
              userSkills: {
                some: { kind: SkillKind.SEEK, skillId: { in: seekerOfferIds } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          select: { userId: true },
        })
      : null;

    offerer ??= await this.prisma.userSkill.findFirst({
      where: { skillId, kind: SkillKind.OFFER, userId: { not: seekerId } },
      orderBy: { createdAt: 'asc' },
      select: { userId: true },
    });

    if (!offerer) return;
    await this.createMatch(seekerId, offerer.userId, skillId);
  }

  private async rescueWaitingSeekers(
    offererId: string,
    skillId: string,
  ): Promise<void> {
    const seekers = await this.prisma.userSkill.findMany({
      where: {
        skillId,
        kind: SkillKind.SEEK,
        userId: { not: offererId },
        user: {
          seekerMatches: { none: { skillId, status: MatchStatus.ACTIVE } },
        },
      },
      orderBy: { createdAt: 'asc' }, // FIFO fairness — longest waiter first
      select: { userId: true },
    });
    for (const s of seekers) {
      await this.createMatch(s.userId, offererId, skillId);
    }
  }

  private async createMatch(
    seekerId: string,
    offererId: string,
    skillId: string,
  ): Promise<void> {
    try {
      await this.prisma.match.create({
        data: { seekerId, offererId, skillId },
      });
      this.logger.log(
        `Matched seeker=${seekerId} offerer=${offererId} skill=${skillId}`,
      );
    } catch (e) {
      if (isUniqueViolation(e)) return;
      throw e;
    }
  }
}
