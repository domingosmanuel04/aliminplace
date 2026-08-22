import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuditService } from '../../common/audit.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, AuditService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, AuditService],
})
export class AuthModule {}
