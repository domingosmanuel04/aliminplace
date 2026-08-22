import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ctx } from './als';

@Injectable()
export class AuditService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async log(action: string, entity: string, entityId?: string, metadata: Record<string, unknown> = {}) {
    const c = ctx();
    await this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        metadata: metadata as any,
        tenantId: c.tenantId,
        userId: c.userId,
      },
    });
  }
}
