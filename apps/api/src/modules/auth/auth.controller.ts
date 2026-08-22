import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Public } from '../../common/decorators';
import { ctx } from '../../common/als';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: any, @Res({ passthrough: true }) res: any) {
    return this.auth.register(dto, req, res);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: any) {
    return this.auth.login(dto, req, res);
  }

  @Public()
  @Post('refresh')
  refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    return this.auth.refresh(req, res);
  }

  @Post('logout')
  logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    return this.auth.logout(req, res);
  }

  @Get('me')
  me() {
    return this.auth.me(ctx().userId!);
  }

  @Post('2fa/enable')
  enable2fa() {
    return this.auth.enable2fa(ctx().userId!);
  }

  @Post('2fa/confirm')
  confirm2fa(@Body() body: { otp: string }) {
    return this.auth.confirm2fa(ctx().userId!, body.otp);
  }

  @Post('onboarding')
  onboarding(@Body() body: { storeName: string; template?: string }) {
    return this.auth.createStoreOnboarding(ctx().userId!, body);
  }
}
