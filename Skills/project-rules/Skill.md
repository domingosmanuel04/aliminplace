# Project Rules Skill

## Objetivo

Esta skill define as regras globais que o agente de IA deve seguir ao trabalhar neste projeto.

Estas regras têm prioridade sobre decisões arbitrárias de implementação.

O agente deve preservar a identidade visual, arquitetura, padrões de código e experiência do utilizador existentes no projeto.

---

# 1. Regra principal

Antes de criar, modificar, remover ou refatorar qualquer parte da aplicação:

1. Inspecionar a estrutura existente.
2. Identificar os componentes relacionados.
3. Identificar os estilos existentes.
4. Identificar o Design System.
5. Verificar se já existe uma solução semelhante.
6. Reutilizar componentes, tokens e padrões existentes sempre que possível.

Não criar uma solução nova quando já existe uma solução adequada no projeto.

---

# 2. Hierarquia das Skills

Quando várias skills forem relevantes, seguir esta ordem:

```text
PROJECT RULES
      ↓
DESIGN SYSTEM
      ↓
FRONTEND
      ↓
GSAP ANIMATION
      ↓
ACCESSIBILITY / PERFORMANCE
```

O agente nunca deve utilizar GSAP, CSS, Tailwind ou outra tecnologia para quebrar as regras definidas pelo Design System.

---

# 3. Design System é a fonte de verdade

O Design System existente no projeto é a fonte oficial para:

* Cores
* Tipografia
* Espaçamento
* Border radius
* Sombras
* Botões
* Cards
* Inputs
* Containers
* Grid
* Breakpoints
* Estados
* Componentes
* Animações
* Interações

Nunca substituir os valores existentes por valores inventados.

---

# 4. Regra de cores

Esta é uma regra obrigatória.

Antes de adicionar qualquer cor:

1. Procurar os tokens de cor existentes.
2. Verificar variáveis CSS.
3. Verificar Tailwind configuration, caso exista.
4. Verificar theme/provider.
5. Verificar componentes existentes.
6. Utilizar as cores já definidas.

Não criar novas cores sem necessidade.

Não utilizar cores aleatórias para:

* backgrounds
* textos
* botões
* borders
* ícones
* gradientes
* sombras
* estados hover
* estados active
* animações

Se uma nova cor for realmente necessária, perguntar ao utilizador antes de introduzi-la.

---

# 5. Não alterar identidade visual

Não alterar sem autorização:

* Logo
* Cores principais
* Tipografia
* Identidade visual
* Estrutura principal
* Componentes globais
* Navbar
* Footer
* Botões globais
* Tokens de design

Uma tarefa específica não deve causar alterações não relacionadas.

---

# 6. Reutilização

Antes de criar um novo componente, procurar componentes existentes.

Preferir:

```text
Button existente
Card existente
Modal existente
Input existente
Container existente
Typography existente
Section existente
```

em vez de criar duplicações.

---

# 7. Código existente

Não reescrever grandes partes do projeto sem necessidade.

Alterar apenas o necessário para cumprir a tarefa.

Evitar:

* refatorações não solicitadas
* renomeações desnecessárias
* mudanças de arquitetura
* remoção de dependências
* alteração de configurações globais

---

# 8. Dependências

Antes de instalar uma biblioteca:

1. Verificar se ela já está instalada.
2. Verificar se o problema pode ser resolvido com ferramentas existentes.
3. Evitar dependências desnecessárias.

Não instalar bibliotecas automaticamente sem necessidade.

---

# 9. Responsividade

Toda interface deve funcionar corretamente em:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Não assumir que o comportamento desktop funciona automaticamente no mobile.

---

# 10. Performance

Priorizar:

* código eficiente
* componentes reutilizáveis
* lazy loading quando apropriado
* imagens otimizadas
* animações performantes
* redução de JavaScript desnecessário

---

# 11. Acessibilidade

Respeitar:

* contraste
* navegação por teclado
* foco
* semântica HTML
* aria quando necessário
* reduced motion
* tamanho adequado dos elementos interativos

---

# 12. Antes de concluir uma tarefa

Verificar:

```text
□ O Design System foi respeitado?
□ As cores existentes foram utilizadas?
□ Algum estilo novo foi inventado?
□ Componentes existentes foram reutilizados?
□ O mobile funciona?
□ O desktop funciona?
□ Não existem erros no console?
□ Não existem erros de TypeScript?
□ A animação está performante?
□ A acessibilidade foi preservada?
```

# Carregamento obrigatório de Skills

Antes de executar qualquer tarefa, o agente deve identificar quais
Skills são relevantes para a solicitação.

## Animações

Se a tarefa envolver qualquer uma das seguintes situações:

- animação
- movimento
- entrada de elementos
- scroll animation
- parallax
- hover avançado
- transição complexa
- cards animados
- hero animado
- menu animado
- modal animado
- carousel animado
- timeline
- GSAP
- ScrollTrigger

O agente DEVE consultar:

skills/gsap-animation/SKILL.md

Antes de implementar a solução.

## Interface

Se a tarefa envolver:

- cores
- tipografia
- componentes
- espaçamento
- layout
- botões
- cards
- navbar
- formulários

O agente DEVE consultar:

skills/design-system/SKILL.md

## Regra combinada

Se a tarefa envolver simultaneamente interface e animação:

1. Consultar `design-system/SKILL.md`.
2. Consultar `gsap-animation/SKILL.md`.
3. Implementar respeitando ambas.
---

# Regra final

O agente deve tratar o projeto como um sistema existente.

Não deve redesenhar o projeto enquanto implementa uma funcionalidade.

**Preservar antes de modificar.**

**Reutilizar antes de criar.**

**Consultar antes de inventar.**
