# Como funciona a Aluniplace

## 1. Visão geral

A Aluniplace é uma plataforma SaaS multi-tenant para Angola, focada na venda e no consumo de cursos online. Cada produtor pode criar o seu espaço, cadastrar cursos, receber pagamentos em Kwanzas e acompanhar a operação num dashboard.

A plataforma centraliza:

- criação e gestão de espaços de cursos;
- catálogo e marketplace de cursos;
- checkout, carrinho e cupons;
- pagamentos e confirmação por referência;
- liberação digital de cursos após pagamento;
- área de membros para assistir às aulas;
- afiliados e comissões;
- carteira, taxas e saques;
- analytics, suporte, notificações e auditoria;
- ferramentas de IA para vendas;
- administração global da plataforma.

A moeda principal é AOA/Kz e o idioma e timezone padrão são `pt-AO` e `Africa/Luanda`.

## 2. Quem usa o sistema

### Aluno

Navega pelo marketplace ou pela página pública de um produtor, escolhe um curso, aplica cupom, conclui o checkout e recebe acesso à área de membros após a confirmação do pagamento.

### Produtor ou instrutor

Cria a sua conta e espaço, estrutura cursos com módulos e aulas, publica ofertas, acompanha vendas, gere alunos, cupons e saques.

### Afiliado

Consulta cursos disponíveis, solicita participação, obtém links de divulgação e recebe comissão quando uma venda é atribuída ao seu link.

### Equipa do produtor

O produtor pode convidar membros com funções como administrador, financeiro, suporte, marketing, editor ou vendedor. Cada função recebe permissões específicas.

### Super administrador

Opera a plataforma inteira: tenants, utilizadores, taxas, saques, logs, relatórios e indicadores globais.

### Quem pode criar e publicar cursos

O aluno comum não pode criar nem publicar cursos. A sua função é comprar, assistir às aulas, acompanhar o progresso e obter certificados.

Pode publicar cursos quem tiver um espaço de produtor e a permissão `courses.write`:

| Perfil                                    | Pode publicar cursos? | Responsabilidade                                       |
| ----------------------------------------- | --------------------- | ------------------------------------------------------ |
| Aluno                                     | Não                   | Comprar e consumir cursos                              |
| Proprietário do espaço                    | Sim                   | Gerir o espaço, cursos, vendas e equipa                |
| Administrador                             | Sim                   | Gerir cursos e a operação autorizada pelo proprietário |
| Editor                                    | Sim                   | Criar e editar cursos e conteúdos                      |
| Suporte, financeiro, marketing e vendedor | Não por padrão        | Executar apenas as tarefas da sua permissão            |
| Super administrador                       | Sim                   | Administrar a plataforma globalmente                   |

Uma mesma pessoa pode ter mais de um papel. Por exemplo, pode ser aluno num curso e, ao mesmo tempo, produtor ou editor num espaço próprio. O que define a capacidade de publicar não é o cadastro do utilizador, mas a associação ao tenant e a permissão atribuída.

O curso deve passar pelo ciclo de rascunho, revisão quando aplicável e publicação. Ter permissão para editar não deve permitir ignorar validações, regras de conteúdo ou auditoria.

## 3. Arquitetura do sistema

```text
Navegador
   |
   v
Next.js Web --------------------------+
   |                                  |
   | HTTP / cookie / Bearer           | páginas públicas,
   v                                  | dashboards e páginas de cursos
NestJS API                            |
   |                                  |
   +--> PostgreSQL + Prisma           |
   +--> Redis / cron / worker         |
   +--> MinIO / S3 para ficheiros     |
   +--> PaymentGateway / PSP          |
   +--> Webhooks de pagamento <-------+

Nginx (produção) encaminha Web e API.
```

### Componentes

- `apps/web`: aplicação Next.js, páginas públicas, autenticação, marketplace, checkout, dashboard e área de membros.
- `apps/api`: API NestJS versionada em `/v1`, regras de negócio, autenticação, pagamentos, matrículas, jobs e módulos administrativos.
- `packages/database`: schema Prisma, migrações e seed PostgreSQL.
- `packages/shared`: enums, planos, permissões e eventos partilhados entre aplicações.
- `Redis`: cache, filas e apoio aos jobs.
- `MinIO`: storage compatível com S3 para conteúdos e ficheiros.
- `Nginx`: reverse proxy quando o perfil completo de produção é usado.

## 4. Multi-tenancy

Um tenant representa o espaço de um produtor. O tenant possui membros, cursos, ofertas, pedidos, alunos, finanças e configurações.

O acesso é isolado por tenant:

1. o utilizador inicia sessão;
2. o JWT e o contexto da requisição identificam o tenant ativo;
3. o header `x-tenant-id` pode informar o tenant selecionado;
4. guards e serviços verificam autenticação, papel e permissão;
5. consultas e alterações são feitas apenas no contexto permitido.

O super administrador possui acesso operacional global, conforme as regras administrativas da API.

## 5. Autenticação e conta

A jornada de conta é:

```text
Registo -> login -> sessão -> onboarding -> acesso ao dashboard
```

A API suporta:

- registo e login;
- consulta do utilizador atual;
- refresh de sessão;
- logout e revogação;
- cookie `access_token` httpOnly ou `Authorization: Bearer`;
- histórico de login;
- sessões e refresh tokens;
- ativação e confirmação de 2FA;
- verificação de email, quando configurada.

Depois do registo, o onboarding cria ou completa o espaço do produtor. O produtor passa então a configurar o perfil, criar o primeiro curso e publicar a sua oferta.

### Como o utilizador cria a sua conta

O cadastro é único para cada pessoa. O formulário de registo solicita:

- nome completo;
- email válido;
- palavra-passe com pelo menos 8 caracteres;
- telefone, opcionalmente.

O fluxo de criação é:

```text
Visitante -> Registo -> preencher dados -> conta criada -> login automático
                                          |
                                          +-> escolher estudar -> área do aluno
                                          |
                                          +-> escolher ensinar -> onboarding do produtor
```

O novo utilizador começa como aluno e pode explorar e comprar cursos. Se quiser ensinar, inicia o onboarding de produtor, informa o nome do seu espaço e passa a ter um tenant próprio. Nesse espaço recebe o papel `OWNER` e as permissões de proprietário, incluindo `courses.write`.

Uma pessoa pode utilizar a mesma conta para estudar cursos de outros produtores e administrar os seus próprios cursos. O sistema separa essas experiências pelo contexto: `/members` é a área do aluno e `/dashboard` é a área de gestão do produtor.

## 6. Cursos, catálogo e publicação

Cada espaço de produtor pode ter nome, slug, domínio, estado e cursos próprios. Um curso possui título, descrição, capa, preço, estado, módulos, aulas, materiais complementares e regras de acesso.

Os formatos de conteúdo podem incluir:

- vídeo;
- áudio;
- texto;
- ficheiro para download;
- quiz;
- aula ao vivo ou sessão de mentoria, quando configurada no curso.

### Como o produtor cria um curso

Somente o proprietário, administrador ou editor com a permissão `courses.write` pode criar e editar a estrutura de um curso. O produtor segue estes passos:

1. entra no `/dashboard`;
2. abre a área de cursos e escolhe **Novo curso**;
3. informa nome, descrição, capa, categoria, preço e condições de acesso;
4. cria os módulos na ordem em que serão estudados;
5. adiciona as aulas e define tipo, conteúdo, vídeo, duração e materiais;
6. grava o curso como rascunho;
7. revê a página pública e o checkout;
8. envia para revisão ou publica, conforme a regra do espaço.

Tecnicamente, o registo comercial do curso utiliza o recurso `Product` e recebe o tipo `COURSE`. O currículo é gravado pela rota `/courses/:productId/curriculum`, protegida pela permissão `courses.write`. Isso é apenas uma decisão interna da API: para o utilizador, trata-se sempre de um curso online.

O produtor pode guardar alterações sem publicar. Enquanto estiver em rascunho, o curso não aparece no marketplace nem pode ser comprado. Depois de publicado, aparece na página pública do espaço e fica disponível para compra, respeitando as validações da plataforma.

Ciclo de publicação:

```text
Rascunho -> revisão (quando aplicável) -> publicado -> arquivado
                                      \-> rejeitado
```

Um curso publicado pode aparecer na página pública do produtor e no marketplace, respeitando as regras de visibilidade e permissões.

Rotas públicas relevantes:

- `/public/stores/:slug`: dados públicos do espaço do produtor;
- `/public/stores/:slug/products/:productSlug`: página pública do curso;
- `/public/stores/:slug/checkouts/:checkoutSlug`: checkout do curso;
- `/marketplace`: catálogo público de cursos.

## 7. Carrinho e checkout

O carrinho é persistido por `sessionId`, permitindo que o aluno mantenha os cursos durante a navegação. O fluxo é:

```text
Página do curso ou marketplace
   -> escolher curso
   -> rever carrinho
   -> aplicar cupom
   -> iniciar checkout
   -> escolher pagamento
   -> criar pedido
```

O checkout calcula o total com base no curso, descontos e eventuais ofertas adicionais. A taxa da plataforma não deve ser definida no frontend: ela é lida de `PlatformFee` na base de dados.

A plataforma também possui estruturas para order bumps, upsells e downsells. Essas ofertas só devem ser apresentadas quando estiverem configuradas e elegíveis para o checkout.

## 8. Pagamentos

O backend usa a abstração `PaymentGateway`, que permite trocar o provedor sem alterar o checkout. Um gateway recebe valor, moeda, método e metadados e devolve estado, referência do provedor, código de referência e dados mínimos do cartão.

Métodos previstos pelo domínio:

- cartão;
- transferência;
- referência;
- PIX, quando aplicável ao provedor;
- carteira;
- outros métodos disponibilizados pelo gateway angolano escolhido.

No sandbox atual:

- um cartão começado por `4242` aprova;
- o token `fail` recusa;
- pagamentos por referência podem ficar pendentes até confirmação em `/payments/confirm`.

O sistema nunca guarda o PAN do cartão. Apenas informações não sensíveis, como `last4` e `brand`, podem ser guardadas quando devolvidas pelo gateway.

Estados de pagamento importantes:

```text
PENDING -> AUTHORIZED -> APPROVED
                    \-> FAILED
APPROVED -> REFUNDED
APPROVED -> PARTIALLY_REFUNDED
APPROVED -> CHARGED_BACK
```

Um curso nunca é liberado apenas porque o aluno chegou à página de sucesso. A matrícula depende de uma confirmação válida do pagamento.

## 9. Webhooks e idempotência

Webhooks são eventos críticos recebidos do gateway ou enviados ao tenant. O processamento deve:

1. validar autenticidade e assinatura, quando fornecida;
2. identificar o evento e o pagamento relacionado;
3. verificar se o evento já foi processado;
4. atualizar pagamento e pedido de forma transacional;
5. criar a matrícula e liberar o acesso apenas após confirmação aprovada;
6. registrar o resultado e permitir replay de uma notificação falhada.

Eventos conceptuais incluem:

- `payment.pending`;
- `payment.approved`;
- `payment.failed`;
- `payment.refunded`;
- `payment.expired`;
- `order.created`.

A API disponibiliza a gestão de webhooks do tenant e replay em `/webhooks/deliveries/:id/replay`.

## 10. Compra, matrícula e acesso

Depois da criação do pedido, a Aluniplace confirma o pagamento e transforma a compra numa matrícula no curso.

### Curso online

```text
Pagamento aprovado -> pedido PAID -> matrícula criada
                    -> email/notificação -> área de membros
```

Cursos podem ter módulos, aulas, progresso, quizzes, tentativas e certificados verificáveis por código público.

O pedido representa apenas a transação digital e os seus estados principais são `AWAITING_PAYMENT`, `PAID`, `CANCELLED` e `RETURNED`. Em caso de reembolso ou chargeback, o acesso deve ser revogado ou ajustado conforme a política da plataforma.

## 11. Área do aluno e escolha de cursos

A área do aluno é o espaço pessoal onde o utilizador encontra cursos para comprar e cursos que já comprou. Ela não deve ser confundida com o dashboard do produtor: o aluno estuda; o produtor cria e gere cursos.

### Visitante sem login

Qualquer visitante pode:

1. entrar no marketplace em `/marketplace`;
2. pesquisar e filtrar cursos publicados;
3. abrir a página pública de um curso;
4. consultar descrição, instrutor, programa, preço e informações de acesso;
5. iniciar a compra pelo checkout.

O visitante pode explorar o catálogo sem conta. Para finalizar a compra e receber a matrícula, deve fazer login ou criar uma conta de aluno durante o checkout.

### Aluno depois do login

Depois do login, o aluno deve ser encaminhado para `/members` ou para a página que tentou acessar. A área pode apresentar:

- **Meus cursos**: cursos comprados e disponíveis para estudar;
- **Continuar a estudar**: curso em andamento e a próxima aula;
- **Explorar cursos**: atalho para o marketplace;
- **Progresso**: percentagem concluída por curso;
- **Certificados**: certificados obtidos ou disponíveis;
- **Compras**: histórico de pedidos e pagamentos;
- **Perfil e segurança**: dados pessoais, sessões e 2FA;
- **Ajuda**: notificações e suporte.

O fluxo de escolha e estudo é:

```text
Visitante -> marketplace -> página do curso -> login ou registo
          -> checkout -> pagamento confirmado -> matrícula
          -> Meus cursos -> curso -> módulo -> aula -> progresso
```

Ao selecionar um curso em **Meus cursos**, o aluno abre `/members/courses/:id`. A página apresenta os módulos e aulas liberados, permite continuar de onde parou, guardar o progresso, responder quizzes e acompanhar os critérios para o certificado.

O aluno só vê cursos publicados no catálogo e cursos nos quais possui matrícula válida. O acesso deve estar associado a um pedido ou pagamento confirmado, e não apenas ao cadastro do utilizador.

## 12. Afiliados

O fluxo de afiliado é:

```text
Catálogo de afiliados -> pedido de participação -> aprovação do produtor
                     -> link de afiliado -> clique rastreado
                     -> venda atribuída -> comissão -> saldo elegível
```

O sistema mantém afiliado, links, cliques, vendas e comissões. A aprovação pode ser decidida pelo produtor. O link público usa a rota `/affiliates/r/:code`, que regista a origem antes de encaminhar o visitante para a oferta.

A atribuição precisa permanecer associada ao checkout e ao pedido para evitar perda da origem da venda. Cancelamentos, reembolsos e chargebacks devem refletir-se na comissão e no ledger.

## 13. Finanças, taxas e saques

Cada venda gera movimentos financeiros no ledger. Os principais tipos são:

- venda;
- taxa da plataforma;
- comissão;
- reembolso;
- chargeback;
- saque;
- ajuste;
- coprodução.

A carteira do vendedor mostra saldo, movimentos e valores disponíveis. O saldo pode ficar pendente até o prazo definido pela plataforma e ser liberado por job/cron.

Fluxo de saque:

```text
Solicitado -> em revisão -> aprovado -> processando -> concluído
                         \-> rejeitado
```

A API de finanças expõe carteira, histórico de saques e criação de pedido de saque. Taxas são administradas no backend e não devem ser hardcoded no frontend.

## 14. Analytics, suporte e comunicação

O vendedor acompanha KPIs do tenant em `/analytics/dashboard` e pode consultar insights em `/analytics/insights`. Os dados devem refletir pedidos, pagamentos, receita, taxas e conversões registados na base.

O sistema também possui:

- notificações e marcação como lida;
- tickets de suporte e respostas;
- reviews moderáveis;
- eventos de tracking;
- logs de auditoria;
- relatórios para análise administrativa;
- campanhas e jobs de email no modelo de dados.

## 15. IA de vendas

O módulo de IA oferece endpoints para tarefas assistidas, como:

- copilot geral;
- configuração do espaço do produtor;
- criação de curso;
- otimização de checkout;
- sugestão de preço;
- geração de copy.

A IA apoia o trabalho do produtor, mas não deve publicar cursos, aprovar pagamentos, alterar saldo ou liberar acessos sem passar pelas regras e permissões do backend.

## 16. Administração da plataforma

O super admin possui uma visão global para acompanhar:

- GMV e indicadores da plataforma;
- tenants e respetivos estados;
- utilizadores;
- taxas configuradas;
- saques;
- logs e auditoria;
- relatórios.

A administração deve preservar o histórico das decisões financeiras e operacionais. Alterações de taxa, utilizador, tenant ou saque precisam ser auditáveis.

## 17. API principal

Base local: `http://localhost:4000/v1`

Swagger: `http://localhost:4000/docs`

Endpoints principais:

| Domínio             | Endpoints                                                                   |
| ------------------- | --------------------------------------------------------------------------- |
| Auth                | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/onboarding`             |
| Espaço e cursos     | `/stores`, `/products`, `/public/stores/:slug`                              |
| Carrinho e checkout | `/cart`, `/checkout`, `/payments/confirm`                                   |
| Pedidos             | `/orders`, `/orders/:id/status`, `/orders/:id/refund`                       |
| Marketplace         | `/marketplace`                                                              |
| Afiliados           | `/affiliates/catalog`, `/affiliates/apply`, `/affiliates/me`                |
| Finanças            | `/finance/wallet`, `/finance/payouts`                                       |
| Aprendizagem        | `/members/enrollments`, `/members/courses/:id`, `/verify/certificate/:code` |
| Analytics           | `/analytics/dashboard`, `/analytics/insights`                               |
| IA                  | `/ai/copilot` e endpoints especializados                                    |
| Administração       | `/admin/overview`, `/admin/tenants`, `/admin/payouts`, `/admin/logs`        |
| Operação            | `/health`, `/notifications`, `/tickets`, `/webhooks`                        |

## 18. Segurança e regras essenciais

- autenticar rotas privadas com cookie httpOnly ou Bearer;
- verificar tenant, papel e permissão em cada operação;
- nunca guardar PAN ou credenciais de pagamento;
- validar webhooks e aplicar idempotência;
- liberar aulas e materiais somente com pagamento confirmado;
- usar HTTPS e `COOKIE_SECURE=true` em produção;
- manter secrets fortes para JWT, PostgreSQL e MinIO;
- ativar rate limit e 2FA conforme o ambiente;
- manter storage privado para conteúdos pagos e usar URLs controladas;
- registrar alterações críticas em auditoria;
- fazer backups diários do PostgreSQL.

## 19. Execução local

Pré-requisitos: Node 22+, pnpm 9 e Docker.

```bash
pnpm install
pnpm docker:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Serviços locais:

- Web: `http://localhost:3000`;
- API: `http://localhost:4000/v1`;
- Swagger: `http://localhost:4000/docs`;
- Health: `http://localhost:4000/v1/health`;
- PostgreSQL: porta `5450`;
- Redis: porta `6390`;
- MinIO API: porta `9020`;
- MinIO Console: porta `9021`.

Para subir o perfil completo com API, web, worker e Nginx:

```bash
docker compose --profile full up -d --build
```

## 20. Estado atual e evolução

### Já ligado de ponta a ponta

- registo, onboarding e dashboard;
- criação, publicação e exibição de cursos;
- carrinho, cupom e checkout;
- pagamento sandbox com aprovação, recusa e referência;
- matrícula digital após pagamento;
- matrícula e acesso à área de membros;
- ledger de taxas e liberação de saldo por job;
- catálogo, links e cliques de afiliados;
- visão administrativa de GMV, tenants, taxas, saques e logs.

### Extensões que exigem integração ou amadurecimento

- implementação de um gateway real angolano ou internacional;
- configuração de credenciais e webhooks oficiais do PSP escolhido;
- storage S3/CDN de produção para vídeo;
- políticas finais de KYC, saques, reembolsos e chargebacks;
- assinaturas, coprodução e API pública em escala;
- observabilidade, alertas e procedimentos de recuperação de incidentes.

A regra de evolução é estabilizar autenticação, utilizadores, produtores, cursos, checkout, pagamentos, webhooks, matrículas, área de membros e dashboard antes de ampliar funcionalidades avançadas.
