import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RequirePerms } from '../../common/decorators';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(@Inject(AnalyticsService) private a: AnalyticsService) {}

  @Get('dashboard')
  @RequirePerms('analytics.read')
  dashboard() {
    return this.a.dashboard();
  }

  @Get('insights')
  @RequirePerms('analytics.read')
  insights() {
    return this.a.insights();
  }
}
