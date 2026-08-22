import { Injectable, NestMiddleware } from '@nestjs/common';
import { als } from './als';

@Injectable()
export class AlsMiddleware implements NestMiddleware {
  use(_req: any, _res: any, next: () => void) {
    als.run({}, () => next());
  }
}
