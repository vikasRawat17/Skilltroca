import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SkillsModule } from './skills/skills.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { MatchModule } from './match/match.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    OnboardingModule,
    SessionsModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    SkillsModule,
    MatchModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
