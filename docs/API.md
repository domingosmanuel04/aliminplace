# API Trauner

Base: `http://localhost:4000/v1`  
OpenAPI interactivo: `http://localhost:4000/docs`

Autenticação: cookie `access_token` (httpOnly) ou `Authorization: Bearer`.  
Tenant: header `x-tenant-id` (também no JWT após login).

## Principais recursos

| Método | Caminho | Auth |
|---|---|---|
| POST | /auth/register | público |
| POST | /auth/login | público |
| GET | /auth/me | sim |
| POST | /auth/onboarding | sim |
| GET/POST/PATCH | /products | perms |
| GET | /orders | perms |
| POST | /checkout | público |
| POST | /payments/confirm | público |
| GET | /analytics/dashboard | perms |
| GET | /finance/wallet | perms |
| POST | /ai/copilot | perms |
| GET | /marketplace | público |
| GET | /admin/overview | super admin |
| GET | /members/enrollments | sim |
| GET | /verify/certificate/:code | público |

Webhooks do tenant: `POST /webhooks` com lista de eventos (`payment.approved`, `order.created`, …). Replay: `POST /webhooks/deliveries/:id/replay`.
