import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { RequirePerms } from '../../common/decorators';

@ApiTags('ai')
@RequirePerms('ai.use')
@Controller('ai')
export class AiController {
  constructor(@Inject(AiService) private ai: AiService) {}

  @Post('copilot')
  copilot(@Body() body: { prompt: string }) {
    return this.ai.copilot(body.prompt);
  }

  @Post('store')
  store(@Body() body: { brief: string; apply?: boolean }) {
    return body.apply ? this.ai.applyStore(body.brief) : this.ai.buildStore(body.brief);
  }

  @Post('product')
  product(@Body() body: { brief: string }) {
    return this.ai.buildProduct(body.brief);
  }

  @Post('checkout-optimizer')
  checkout() {
    return this.ai.optimizeCheckout();
  }

  @Post('pricing')
  pricing() {
    return this.ai.pricing();
  }

  @Post('copy')
  copy(@Body() body: { kind: string; brief: string }) {
    return this.ai.copy(body.kind, body.brief);
  }
}
