import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { IS_PUBLIC, PERMS, SUPER } from "./decorators";
import { als } from "./als";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private jwt: JwtService,
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(Reflector) private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();
    const token = this.readToken(req);

    if (!token) {
      if (isPublic) {
        als.enterWith({});
        return true;
      }
      throw new UnauthorizedException("Sessão inválida");
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user || user.status !== "ACTIVE")
        throw new UnauthorizedException("Conta inactiva");

      const tenantId = user.isSuperAdmin
        ? undefined
        : (req.headers["x-tenant-id"] as string) || payload.tenantId;
      let permissions: string[] = [];
      let role: string | undefined;
      if (tenantId) {
        const member = await this.prisma.teamMember.findUnique({
          where: { tenantId_userId: { tenantId, userId: user.id } },
        });
        if (member) {
          permissions = member.permissions.includes("*")
            ? ["*"]
            : member.permissions;
          role = member.role;
        } else if (!user.isSuperAdmin) {
          if (!isPublic)
            throw new ForbiddenException("Sem acesso a este tenant");
        }
      }

      req.user = user;
      const store = als.getStore() || {};
      store.userId = user.id;
      store.tenantId = tenantId;
      store.isSuperAdmin = user.isSuperAdmin;
      store.permissions = permissions;
      store.role = role;
      if (!als.getStore()) als.enterWith(store);

      if (
        this.reflector.getAllAndOverride<boolean>(SUPER, [
          context.getHandler(),
          context.getClass(),
        ])
      ) {
        if (!user.isSuperAdmin)
          throw new ForbiddenException("Apenas super admin");
      }

      const needed = this.reflector.getAllAndOverride<string[]>(PERMS, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (needed?.length && !user.isSuperAdmin && !permissions.includes("*")) {
        const ok = needed.every((p) => permissions.includes(p));
        if (!ok) throw new ForbiddenException("Permissão insuficiente");
      }

      return true;
    } catch (e) {
      if (e instanceof ForbiddenException || e instanceof UnauthorizedException)
        throw e;
      if (isPublic) {
        als.enterWith({});
        return true;
      }
      throw new UnauthorizedException("Token expirado");
    }
  }

  private readToken(req: any): string | undefined {
    const header = req.headers.authorization as string | undefined;
    if (header?.startsWith("Bearer ")) return header.slice(7);
    return req.cookies?.access_token;
  }
}
