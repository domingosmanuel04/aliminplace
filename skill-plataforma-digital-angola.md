# Skill: Plataforma Digital Angola

## Objetivo

Esta skill define as regras obrigatórias para qualquer IA que trabalhe neste projeto.

O projeto é uma plataforma angolana de venda de produtos e serviços digitais, inspirada no modelo de plataformas como a Kiwify, mas com identidade, arquitetura, regras de negócio e experiência próprias para o mercado de Angola.

A IA deve tratar esta skill como contexto permanente do projeto e segui-la antes de criar, alterar, refatorar ou remover qualquer código.

---

# 1. Regra principal

Antes de executar qualquer tarefa:

1. Entender o pedido do utilizador.
2. Verificar a arquitetura existente.
3. Reutilizar componentes, tokens, funções e padrões existentes.
4. Não criar uma solução paralela quando já existir uma solução no projeto.
5. Não alterar regras de negócio sem autorização.
6. Não inventar cores, fontes, espaçamentos, componentes ou comportamentos visuais.
7. Preservar compatibilidade com as funcionalidades existentes.
8. Fazer alterações pequenas, organizadas e fáceis de revisar.

Se houver conflito entre esta skill e o código existente, primeiro analisar o código e sinalizar o conflito antes de fazer uma alteração estrutural.

---

# 2. Contexto do produto

A plataforma deverá permitir que pessoas e empresas em Angola possam:

- criar e vender produtos digitais;
- vender cursos;
- vender ebooks;
- vender templates;
- vender mentorias;
- vender conteúdos digitais;
- receber pagamentos em Kwanzas;
- disponibilizar produtos automaticamente após pagamento;
- acompanhar vendas;
- trabalhar com afiliados;
- controlar comissões;
- futuramente trabalhar com assinaturas;
- futuramente trabalhar com coprodução;
- futuramente disponibilizar API pública.

O foco inicial é o mercado angolano.

A plataforma NÃO deve ser tratada como uma cópia visual da Kiwify.

A Kiwify é apenas uma referência de modelo de negócio e funcionalidades.

---

# 3. Prioridade do MVP

A IA deve priorizar primeiro:

1. Autenticação
2. Utilizadores
3. Produtores
4. Produtos
5. Checkout
6. Pagamentos
7. Webhooks
8. Pedidos
9. Entrega digital
10. Área de membros
11. Dashboard do produtor

Somente depois devem ser priorizados:

- afiliados;
- marketplace de afiliados;
- comissões;
- cupons;
- upsell;
- assinaturas;
- coprodução;
- analytics avançado;
- API pública.

Não implementar funcionalidades avançadas antes de a base estar estável.

---

# 4. Mercado e moeda

O mercado principal é Angola.

Moeda principal:

AOA / Kz

Exibição:

- 35.000 Kz
- 50.000 Kz
- 100.000 Kz

Não utilizar R$, $, € ou outra moeda como moeda principal da aplicação.

Quando uma integração externa exigir outra representação monetária, manter a conversão isolada no serviço de integração.

---

# 5. Pagamentos

O sistema deve ser preparado para integração com meios de pagamento disponíveis em Angola.

Prioridades:

- Multicaixa Express
- Referência Multicaixa
- outros PSPs/gateways compatíveis com Angola

A IA NÃO deve inventar APIs, endpoints, credenciais, webhooks ou respostas de gateways.

Se a documentação de um gateway não estiver disponível no projeto:

1. identificar a informação em falta;
2. criar uma abstração/interface;
3. não inventar a implementação real;
4. marcar claramente o ponto que depende da documentação oficial.

Arquitetura recomendada:

```text
Checkout
   ↓
Payment Service
   ↓
Payment Provider
   ↓
Gateway/PSP
   ↓
Webhook
   ↓
Payment Service
   ↓
Order
   ↓
Product Delivery
```

Nunca liberar um produto apenas porque o utilizador chegou à página de sucesso.

O acesso deve depender de confirmação confiável do pagamento.

---

# 6. Webhooks

Webhooks de pagamento devem ser tratados como eventos críticos.

Regras:

- validar assinatura quando o provedor fornecer assinatura;
- validar autenticidade;
- utilizar idempotência;
- não processar o mesmo evento duas vezes;
- registrar eventos importantes;
- atualizar o pedido de forma transacional;
- liberar acesso somente após confirmação válida.

Exemplo conceptual:

```text
payment.pending
payment.paid
payment.failed
payment.refunded
payment.expired
```

Os nomes reais devem seguir o gateway utilizado.

---

# 7. Arquitetura recomendada

Frontend:

- React
- Vite
- TypeScript

Backend:

- Node.js
- NestJS

Banco:

- PostgreSQL

ORM:

- Prisma

Cache/filas:

- Redis quando necessário

Infraestrutura:

- Docker

A IA deve verificar primeiro se estas tecnologias já estão configuradas no projeto antes de adicionar dependências.

Não instalar bibliotecas sem necessidade.

---

# 8. Frontend

O frontend deve ser:

- responsivo;
- mobile-first;
- acessível;
- consistente;
- componentizado;
- rápido;
- semanticamente correto.

Preferir:

```text
components/
features/
pages/
layouts/
hooks/
services/
lib/
types/
utils/
```

A estrutura final deve respeitar a arquitetura existente do projeto.

Não reorganizar toda a aplicação apenas por preferência pessoal.

---

# 9. Design System

O Design System existente no projeto é obrigatório.

A IA deve:

- reutilizar cores existentes;
- reutilizar tipografia existente;
- reutilizar componentes existentes;
- reutilizar espaçamentos existentes;
- reutilizar border radius existente;
- reutilizar sombras existentes;
- reutilizar estados existentes;
- reutilizar ícones existentes.

PROIBIDO:

- criar novas cores sem necessidade;
- escolher cores aleatórias;
- criar gradientes aleatórios;
- introduzir uma nova fonte sem autorização;
- misturar estilos diferentes;
- criar componentes duplicados.

Antes de criar um novo componente, procurar se já existe um equivalente.

Se existir, reutilizar.

## Regra de cores

Por padrão, utilizar exclusivamente as cores definidas no Design System
do projeto e utilizadas na página inicial.

Não criar ou introduzir novas cores por iniciativa própria.

### Exceções

Uma nova cor só pode ser utilizada quando o utilizador solicitar
explicitamente.

Quando o utilizador solicitar uma nova cor:

1. Utilizar exatamente a cor solicitada.
2. Não substituir a cor por outra semelhante.
3. Aplicar a nova cor apenas onde foi solicitado.
4. Não alterar a paleta principal do projeto.
5. Não substituir as cores existentes globalmente, salvo se o utilizador
   solicitar explicitamente.
6. Se a nova cor precisar ser adicionada ao Design System, informar o
   utilizador antes de fazer uma alteração global.


---

# 10. Consistência visual

Todas as novas páginas devem parecer parte do mesmo produto.

A página inicial define a referência visual principal quando não houver uma regra mais específica no Design System.

A IA deve manter:

- mesma linguagem visual;
- mesma hierarquia;
- mesmos padrões de botões;
- mesmos inputs;
- mesmos cards;
- mesmos estados;
- mesma escala de espaçamento;
- mesma tipografia.

Não criar uma página com aparência de outro produto.

---

# 11. Componentes

Componentes devem ter responsabilidade única.

Evitar componentes gigantes.

Exemplo:

```text
ProductCard
CheckoutForm
PaymentMethodSelector
OrderSummary
DashboardCard
Sidebar
Navbar
Modal
DataTable
```

Componentes genéricos devem ser reutilizáveis.

Lógica de negócio não deve ficar misturada desnecessariamente com componentes puramente visuais.

---

# 12. Backend

Separar claramente:

```text
Controller
Service
Repository/Data Access
DTO
Validation
Domain Logic
Integration
```

Não colocar toda a lógica dentro do controller.

Validar dados recebidos pelo cliente.

Nunca confiar no frontend para:

- preço;
- comissão;
- estado de pagamento;
- permissões;
- acesso ao produto;
- valores financeiros.

Valores críticos devem ser calculados no backend.

---

# 13. Segurança

Nunca:

- colocar secret keys no frontend;
- colocar credenciais em código;
- expor tokens privados;
- confiar em valores financeiros enviados pelo frontend;
- permitir acesso apenas com base em IDs fornecidos pelo utilizador;
- ignorar autorização.

Utilizar variáveis de ambiente para secrets.

Exemplo:

```env
DATABASE_URL=
PAYMENT_API_KEY=
PAYMENT_SECRET=
JWT_SECRET=
```

Nunca criar valores falsos para secrets.

---

# 14. Autorização

A plataforma terá diferentes papéis.

Exemplo:

```text
CUSTOMER
PRODUCER
AFFILIATE
ADMIN
```

As permissões devem ser verificadas no backend.

Exemplo:

```text
Customer
→ comprar produtos
→ acessar produtos comprados

Producer
→ criar produtos
→ gerir vendas próprias
→ gerir conteúdos próprios

Affiliate
→ consultar produtos disponíveis
→ gerar links
→ consultar suas comissões

Admin
→ gerir plataforma
→ supervisionar utilizadores
→ supervisionar produtos
→ supervisionar pagamentos
```

Nunca permitir que um utilizador acesse recursos de outro utilizador apenas alterando um ID na URL.

---

# 15. Produtos digitais

O sistema deve permitir inicialmente produtos como:

- cursos;
- ebooks;
- arquivos digitais;
- templates;
- materiais digitais.

Um produto deve possuir, conforme o tipo:

```text
id
title
description
price
currency
status
type
owner
createdAt
updatedAt
```

Não assumir que todos os produtos são cursos.

---

# 16. Cursos

Cursos podem possuir:

```text
Course
 ├── Module
 │    ├── Lesson
 │    ├── Lesson
 │    └── Lesson
 └── Module
      ├── Lesson
      └── Lesson
```

O progresso do aluno deve ser persistido.

Exemplo:

```text
Enrollment
LessonProgress
CourseProgress
```

---

# 17. Checkout

O checkout deve ser simples.

Prioridades:

- clareza;
- confiança;
- poucos campos;
- boa experiência mobile;
- resumo da compra;
- método de pagamento;
- estado do pagamento;
- tratamento de erros.

Estados possíveis:

```text
checkout
pending
processing
paid
failed
expired
refunded
```

Não mostrar "Pagamento aprovado" sem confirmação real.

---

# 18. Afiliados

O sistema de afiliados deve ser preparado para:

```text
Producer
   ↓
Affiliate Program
   ↓
Affiliate
   ↓
Tracking Link
   ↓
Customer
   ↓
Order
   ↓
Commission
```

Cada venda deve poder identificar sua origem quando aplicável.

Não atribuir comissão diretamente no frontend.

A comissão deve ser calculada e registrada no backend.

---

# 19. Comissões

Uma comissão deve possuir histórico auditável.

Exemplo:

```text
commission
- id
- orderId
- affiliateId
- amount
- percentage
- status
- createdAt
```

Estados possíveis:

```text
PENDING
AVAILABLE
PAID
CANCELLED
```

Não apagar informações financeiras importantes.

Preferir histórico e estados.

---

# 20. Dados financeiros

Informações financeiras são sensíveis.

Registrar eventos importantes.

Exemplo:

```text
Order
Payment
PaymentEvent
Commission
Payout
Refund
```

Evitar alterações destrutivas.

Preferir:

```text
status changes
audit logs
timestamps
transaction records
```

---

# 21. API

Endpoints devem seguir uma convenção consistente.

Exemplo:

```text
POST   /auth/login
POST   /auth/register

GET    /products
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id

POST   /orders
GET    /orders/:id

POST   /payments
POST   /payments/webhook

GET    /dashboard
GET    /commissions
```

Seguir os padrões já existentes no projeto quando forem diferentes.

---

# 22. Banco de dados

Usar relacionamentos claros.

Entidades principais:

```text
User
Producer
Customer
Affiliate
Product
Course
Module
Lesson
Enrollment
Order
OrderItem
Payment
PaymentEvent
Commission
AffiliateLink
Payout
Refund
Subscription
Coupon
WebhookEvent
AuditLog
```

Não criar tabelas duplicadas para representar o mesmo conceito.

---

# 23. Erros

Erros devem ser tratados de forma previsível.

Frontend:

- mensagens claras;
- estados de loading;
- estados vazios;
- estados de erro;
- retry quando apropriado.

Backend:

- validação;
- códigos HTTP corretos;
- logs;
- mensagens sem expor secrets ou detalhes internos.

---

# 24. Loading, Empty e Error States

Toda funcionalidade que busca dados deve considerar:

```text
Loading
Success
Empty
Error
```

Não deixar páginas quebradas quando não existirem dados.

Exemplo:

```text
Ainda não tens produtos.

[ Criar primeiro produto ]
```

---

# 25. Responsividade

Prioridade:

```text
Mobile
Tablet
Desktop
```

Não desenvolver apenas para desktop.

Testar principalmente:

- 320px+
- 375px
- 390px
- 768px
- 1024px
- 1280px+

Usar breakpoints definidos pelo projeto.

---

# 26. Performance

Evitar:

- renders desnecessários;
- chamadas duplicadas;
- imagens gigantes;
- dependências desnecessárias;
- consultas sem paginação;
- carregamento de dados que não são utilizados.

Para listas grandes:

- paginação;
- filtros;
- pesquisa;
- ordenação;
- debounce quando necessário.

---

# 27. Testes

Toda funcionalidade crítica deve possuir testes quando a infraestrutura de testes estiver disponível.

Prioridade:

1. autenticação;
2. criação de produto;
3. checkout;
4. pagamento;
5. webhook;
6. acesso após pagamento;
7. comissão;
8. permissões.

Para pagamentos, testar especialmente:

```text
success
failure
pending
duplicate webhook
expired payment
refund
```

---

# 28. Git

Fazer alterações pequenas e organizadas.

Preferir commits como:

```text
feat: add product creation flow
feat: add payment webhook
fix: prevent duplicate payment processing
refactor: improve checkout service
test: add payment webhook tests
```

Não misturar:

```text
design + backend + refactor + unrelated fixes
```

num único commit sem necessidade.

---

# 29. Como a IA deve trabalhar

Quando receber uma tarefa:

### Passo 1 — analisar

Entender o pedido e localizar os arquivos relevantes.

### Passo 2 — verificar

Verificar componentes, serviços, tipos, rotas e padrões existentes.

### Passo 3 — planejar

Antes de alterações grandes, explicar brevemente:

- o que será alterado;
- quais arquivos serão afetados;
- qual abordagem será usada.

### Passo 4 — implementar

Alterar somente o necessário.

### Passo 5 — verificar

Executar, quando disponível:

```bash
npm run lint
npm run test
npm run build
```

Ou os comandos equivalentes definidos pelo projeto.

### Passo 6 — relatar

Informar:

- o que foi feito;
- arquivos alterados;
- testes executados;
- problemas encontrados;
- próximos passos, se houver.

---

# 30. Proibições

A IA NÃO deve:

- inventar requisitos;
- inventar APIs de pagamento;
- inventar credenciais;
- copiar visualmente outra plataforma;
- criar cores aleatórias;
- instalar dependências sem necessidade;
- apagar código sem verificar seu uso;
- alterar banco de dados sem considerar migrações;
- ignorar erros de TypeScript;
- ignorar erros de build;
- desativar testes para fazer o projeto passar;
- esconder erros;
- colocar secrets no código;
- implementar funcionalidades fora do escopo sem autorização.

---

# 31. Quando faltar informação

Se uma decisão for crítica e não houver informação suficiente:

NÃO inventar.

Classificar a situação:

```text
BLOQUEANTE
→ precisa de decisão antes de implementar.

NÃO BLOQUEANTE
→ pode usar uma solução temporária segura e documentada.
```

Exemplo:

"Não existe documentação do gateway de pagamento configurado. Vou criar a interface PaymentProvider e deixar a implementação do provider isolada até termos a documentação oficial."

---

# 32. Princípio de produto

A plataforma deve ser:

- simples;
- confiável;
- profissional;
- rápida;
- mobile-first;
- preparada para escalar;
- adequada ao mercado angolano.

A experiência deve transmitir:

> "É fácil vender produtos digitais em Angola."

Não tentar colocar todas as funcionalidades de uma vez.

Construir primeiro um produto sólido.

---

# 33. Regra final

Sempre que existir dúvida entre:

```text
Fazer mais
```

e

```text
Fazer simples e correto
```

preferir:

```text
FAZER SIMPLES E CORRETO.
```

A IA deve priorizar estabilidade, segurança, consistência visual, experiência do utilizador e arquitetura sustentável.
