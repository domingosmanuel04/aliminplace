import { Body, Controller, Get, Inject, Param, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';
import { Public } from '../../common/decorators';
import { ctx } from '../../common/als';

@ApiTags('affiliates')
@Controller('affiliates')
export class AffiliateController {
  constructor(@Inject(AffiliateService) private a: AffiliateService) {}

  @Public()
  @Get('catalog')
  catalog(@Query() q: any) {
    return this.a.marketplace(q);
  }

  @Post('apply')
  apply(@Body() body: { productId: string }) {
    return this.a.apply(body.productId, ctx().userId!);
  }

  @Public()
  @Get('r/:code')
  track(@Param('code') code: string, @Req() req: any) {
    return this.a.trackClick(code, req.ip, req.headers['user-agent']);
  }

  @Get('me')
  me() {
    return this.a.me(ctx().userId!);
  }

  @Get('producer')
  producer() {
    return this.a.producerLinks();
  }

  @Post('producer/:id/decide')
  decide(@Param('id') id: string, @Body() body: { status: 'APPROVED' | 'BLOCKED' }) {
    return this.a.decide(id, body.status);
  }
}
