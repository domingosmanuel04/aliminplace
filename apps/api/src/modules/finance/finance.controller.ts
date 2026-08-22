import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { RequirePerms } from '../../common/decorators';

@ApiTags('finance')
@Controller('finance')
export class FinanceController {
  constructor(@Inject(FinanceService) private f: FinanceService) {}

  @Get('wallet')
  @RequirePerms('finance.read')
  wallet() {
    return this.f.wallet();
  }

  @Get('payouts')
  @RequirePerms('finance.read')
  payouts() {
    return this.f.listPayouts();
  }

  @Post('payouts')
  @RequirePerms('finance.payout')
  request(@Body() body: any) {
    return this.f.requestPayout(body.amount, body.method, body.destination);
  }
}
