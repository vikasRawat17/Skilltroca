import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OnboardingDto } from './dto/onboarding.dto';
import { OnboardingService } from './onboarding.service';

@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post()
  complete(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: OnboardingDto,
  ) {
    return this.onboarding.complete(user.id, dto);
  }
}
