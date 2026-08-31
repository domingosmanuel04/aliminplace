# Aluniplace

Plataforma SaaS multi-tenant para vender **produtos digitais e físicos**: lojas, checkout, pagamentos, cursos, afiliados, assinaturas e IA de vendas.

> Venda qualquer coisa. Em qualquer lugar.

## Stack

| Camada | Tecnologia |
|---|---|
| Web | Next.js 15, React 19, Tailwind |
| API | NestJS 11, Swagger em `/docs` |
| Dados | PostgreSQL 16 + Prisma |
| Cache / filas | Redis + cron Nest |
| Storage | MinIO (S3-compatible) |
| Pagamentos | Interface `PaymentGateway` + **sandbox real** (não é mock de UI) |

## Arranque local

Pré-requisitos: Node 22+, pnpm 9, Docker.

```bash
cp .env.example .env
pnpm install
pnpm docker:up          # Postgres :5450 · Redis :6390 · MinIO :9020
pnpm db:migrate         # na primeira vez, aceite o nome `init`
pnpm db:seed
pnpm dev
```

- App: http://localhost:3000  
- API: http://localhost:4000/v1  
- Swagger: http://localhost:4000/docs  
- Health: http://localhost:4000/v1/health  

Portas 5432/6379/9000 estão reservadas noutros projectos nesta máquina — o Compose do Aluniplace usa **5450 / 6390 / 9020**.

## Contas de demonstração

| Papel | Email | Password |
|---|---|---|
| Super admin | emma.t@example.net | Admin@123! |
| Vendedor (Atlas Fit) | ana@atlasfit.ao | Seller@123! |
| Cliente | cliente1@mail.ao | Cliente@123! |
| Afiliado | afiliado1@mail.ao | Afiliado@123! |

Lojas seed: `/s/atlas-fit`, `/s/nzaia-books`, `/s/kwanza-wear`, `/s/lunda-tech`, `/s/semba-kitchen`.

## Fluxos que estão ligados de ponta a ponta

1. Registo → onboarding da loja → dashboard com KPIs reais da base  
2. Criar produto → publicar → aparecer no marketplace e na loja  
3. Carrinho persistente (local `sessionId`) → cupão → checkout  
4. Pagamento sandbox: cartão `4242…` aprova; token `fail` recusa; referência gera código e confirma em `/payments/confirm`  
5. Digital: matrícula imediata na área de membros  
6. Físico: stock decrementado, pedido `PROCESSING`, envio no dashboard  
7. Taxa da plataforma vai para o ledger; saldo pendente liberta por cron  
8. Afiliado: catálogo → pedido de link → clique `/affiliates/r/:code`  
9. Super admin: GMV, tenants, taxas, saques, logs  

Nenhum PAN de cartão é gravado — apenas `last4` / `brand` devolvidos pelo gateway.

## Pagamentos em produção

Implemente `PaymentGateway` (ver `apps/api/src/payments/gateway.ts`) para o provedor angolano ou internacional escolhido. Mantenha `PAYMENT_GATEWAY=sandbox` até as chaves reais estarem no ambiente. Stripe/PayPal no `.env` são opcionais e **não** activos por omissão.

## Produção

1. Secrets fortes em `JWT_*`, passwords da BD e MinIO  
2. `COOKIE_SECURE=true`, HTTPS no Nginx (`infra/nginx/nginx.conf`)  
3. `pnpm db:migrate:deploy` contra a BD gerida  
4. `docker compose --profile full up -d --build`  
5. Backups diários do volume PostgreSQL  
6. Object storage S3 com bucket privado + CDN para vídeo  
7. Rate limit e 2FA já suportados na API  

## Testes

```bash
pnpm --filter @trauner/api test
pnpm --filter @trauner/web test:e2e   # requer a web a correr
```

## Estrutura

```
apps/api          NestJS (auth, commerce, learning, finance, admin, IA)
apps/web          Next.js (marketing, dashboards, loja, checkout, membros)
packages/database Prisma schema + seed
packages/shared   planos, permissões, eventos
infra/nginx       reverse proxy
```

Taxas **nunca** estão no frontend — leem-se de `PlatformFee` na base, editáveis em `/admin`.
