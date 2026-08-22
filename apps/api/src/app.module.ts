import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AlsMiddleware } from './common/als.middleware';
import { AuthGuard } from './common/auth.guard';
import { AuditService } from './common/audit.service';
import { AuthModule } from './modules/auth/auth.module';
import { CommerceService } from './modules/commerce/commerce.service';
import { CommerceController } from './modules/commerce/commerce.controller';
import { AnalyticsService } from './modules/analytics/analytics.service';
import { AnalyticsController } from './modules/analytics/analytics.controller';
import { FinanceService } from './modules/finance/finance.service';
import { FinanceController } from './modules/finance/finance.controller';
import { LearningService } from './modules/learning/learning.service';
import { LearningController } from './modules/learning/learning.controller';
import { AffiliateService } from './modules/affiliates/affiliate.service';
import { AffiliateController } from './modules/affiliates/affiliate.controller';
import { AdminService } from './modules/admin/admin.service';
import { AdminController } from './modules/admin/admin.controller';
import { AiService } from './modules/ai/ai.service';
import { AiController } from './modules/ai/ai.controller';
import { MiscController } from './modules/misc/misc.controller';
import { SandboxGateway } from './payments/sandbox.gateway';
import { JobsService } from './jobs/jobs.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 120 }] }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [
    CommerceController,
    AnalyticsController,
    FinanceController,
    LearningController,
    AffiliateController,
    AdminController,
    AiController,
    MiscController,
  ],
  providers: [
    AuditService,
    CommerceService,
    AnalyticsService,
    FinanceService,
    LearningService,
    AffiliateService,
    AdminService,
    AiService,
    SandboxGateway,
    JobsService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AlsMiddleware).forRoutes('*');
  }
}
