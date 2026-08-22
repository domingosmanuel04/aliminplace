import {
  Inject,
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { authenticator } from 'otplib';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit.service';
import { ROLE_TEMPLATES } from '@trauner/shared';
import { slugify } from '../../common/util';
import { LoginDto, RegisterDto } from './dto';

const COOKIE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/',
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(JwtService) private jwt: JwtService,
    @Inject(AuditService) private audit: AuditService,
  ) {}

  async register(dto: RegisterDto, req: any, res: any) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Email já registado');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        phone: dto.phone,
        passwordHash: await argon2.hash(dto.password, { type: argon2.argon2id }),
        emailVerifiedAt: new Date(),
      },
    });
    await this.audit.log('user.create', 'User', user.id);
    await this.prisma.loginHistory.create({
      data: { userId: user.id, ip: req.ip, userAgent: req.headers['user-agent'], success: true },
    });
    return this.issue(user, req, res);
  }

  async login(dto: LoginDto, req: any, res: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    const ok = user && (await argon2.verify(user.passwordHash, dto.password));
    if (user) {
      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          success: !!ok,
          reason: ok ? undefined : 'invalid_credentials',
        },
      });
    }
    if (!ok || !user) throw new UnauthorizedException('Credenciais inválidas');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Conta suspensa');
    if (user.twoFactorEnabled) {
      if (!dto.otp || !user.twoFactorSecret || !authenticator.check(dto.otp, user.twoFactorSecret)) {
        throw new UnauthorizedException('Código 2FA necessário');
      }
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.audit.log('login', 'User', user.id);
    return this.issue(user, req, res);
  }

  async refresh(req: any, res: any) {
    const raw = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!raw) throw new UnauthorizedException('Refresh em falta');
    const hash = sha(raw);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh inválido');
    }
    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) throw new UnauthorizedException();
    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    return this.issue(user, req, res);
  }

  async logout(req: any, res: any) {
    const raw = req.cookies?.refresh_token;
    if (raw) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: sha(raw) },
        data: { revokedAt: new Date() },
      });
    }
    res.clearCookie('access_token', COOKIE);
    res.clearCookie('refresh_token', COOKIE);
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: { include: { tenant: { include: { stores: true } } } } },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, twoFactorSecret, ...safe } = user as any;
    return safe;
  }

  async enable2fa(userId: string) {
    const secret = authenticator.generateSecret();
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });
    const otpauth = authenticator.keyuri('user', 'Trauner', secret);
    return { secret, otpauth };
  }

  async confirm2fa(userId: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret || !authenticator.check(otp, user.twoFactorSecret)) {
      throw new BadRequestException('OTP inválido');
    }
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
    return { ok: true };
  }

  async createStoreOnboarding(userId: string, input: { storeName: string; template?: string }) {
    const slug = slugify(input.storeName);
    const taken = await this.prisma.tenant.findUnique({ where: { slug } });
    const finalSlug = taken ? `${slug}-${randomBytes(2).toString('hex')}` : slug;
    const tenant = await this.prisma.tenant.create({
      data: {
        name: input.storeName,
        slug: finalSlug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
            permissions: ROLE_TEMPLATES.owner,
            acceptedAt: new Date(),
          },
        },
        stores: {
          create: {
            name: input.storeName,
            slug: finalSlug,
            template: input.template || 'atelier',
            status: 'DRAFT',
            theme: { primary: '#1C1917', accent: '#C4A574' },
            pages: [
              {
                slug: 'home',
                blocks: [
                  { type: 'hero', title: input.storeName, subtitle: 'A sua nova loja Trauner', cta: 'Ver produtos' },
                  { type: 'products', source: 'all' },
                ],
              },
            ],
          },
        },
        warehouses: { create: { name: 'Principal', isDefault: true, city: 'Luanda' } },
      },
      include: { stores: true },
    });
    await this.prisma.domain.create({
      data: {
        tenantId: tenant.id,
        storeId: tenant.stores[0].id,
        host: `${finalSlug}.localhost`,
        isPrimary: true,
        txtToken: `trauner-verify-${finalSlug}`,
        status: 'ACTIVE',
        verifiedAt: new Date(),
      },
    });
    await this.prisma.checkout.create({
      data: {
        tenantId: tenant.id,
        storeId: tenant.stores[0].id,
        name: 'Checkout padrão',
        slug: 'padrao',
        isDefault: true,
        blocks: [{ type: 'form' }, { type: 'summary' }, { type: 'payment' }],
      },
    });
    await this.audit.log('tenant.create', 'Tenant', tenant.id);
    return tenant;
  }

  private async issue(user: any, req: any, res: any) {
    const memberships = await this.prisma.teamMember.findMany({
      where: { userId: user.id },
      include: { tenant: { include: { stores: true } } },
    });
    const tenantId = memberships[0]?.tenantId;
    const access = await this.jwt.signAsync(
      { sub: user.id, tenantId, sa: user.isSuperAdmin },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL || '15m' },
    );
    const refreshRaw = randomBytes(48).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: sha(refreshRaw),
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });
    await this.prisma.session.create({
      data: { userId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] },
    });
    res.cookie('access_token', access, { ...COOKIE, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshRaw, { ...COOKIE, maxAge: 30 * 24 * 3600 * 1000 });
    const { passwordHash, twoFactorSecret, ...safe } = user;
    return { user: safe, accessToken: access, refreshToken: refreshRaw, memberships };
  }
}

function sha(v: string) {
  return createHash('sha256').update(v).digest('hex');
}
