import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SkillsController } from './skills.controller';

@Module({
  imports: [PrismaModule],
  providers: [SkillsService],
  controllers: [SkillsController],
  exports: [SkillsService],
})
export class SkillsModule {}
