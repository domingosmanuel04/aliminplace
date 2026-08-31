# AGENTS.md

# Regras Globais do Projeto

Este arquivo define as regras obrigatórias que o agente de IA deve seguir antes de criar, modificar, remover ou refatorar qualquer código deste projeto.

---

## 1. REGRA PRINCIPAL

Antes de executar qualquer tarefa, o agente DEVE:

1. Analisar o pedido do utilizador.
2. Identificar quais Skills são relevantes.
3. Ler as Skills relevantes antes de implementar.
4. Inspecionar o código existente.
5. Respeitar a arquitetura atual.
6. Respeitar o Design System.
7. Reutilizar componentes existentes sempre que possível.
8. Só depois executar a implementação.

Nunca começar a alterar código antes de realizar esta análise.

---

# 2. SKILLS DISPONÍVEIS

As Skills deste projeto estão localizadas em:

```text
skills/
```

Skills disponíveis:

```text
skills/project-rules/SKILL.md
skills/design-system/SKILL.md
skills/gsap-animation/SKILL.md
```

---

# 3. PROJECT RULES

Para qualquer tarefa relacionada ao projeto, consultar:

```text
skills/project-rules/SKILL.md
```

Esta Skill define as regras gerais de implementação.

---

# 4. DESIGN SYSTEM

Sempre que a tarefa envolver:

* UI
* layout
* cores
* tipografia
* espaçamento
* componentes
* cards
* botões
* navbar
* formulários
* páginas
* responsividade
* identidade visual

O agente DEVE consultar:

```text
skills/design-system/SKILL.md
```

O Design System é a fonte de verdade visual do projeto.

---

# 5. GSAP ANIMATION

Sempre que a tarefa envolver:

* animação
* GSAP
* ScrollTrigger
* timeline
* parallax
* cards animados
* hero animado
* entrada de elementos
* animações no scroll
* transições avançadas
* hover avançado
* movimento
* microinterações

O agente DEVE consultar:

```text
skills/gsap-animation/SKILL.md
```

Nunca implementar uma animação GSAP sem consultar essa Skill.

---

# 6. TAREFAS DE UI + ANIMAÇÃO

Quando uma tarefa envolver simultaneamente UI e animação, consultar:

```text
skills/design-system/SKILL.md

skills/gsap-animation/SKILL.md
```

A implementação deve respeitar ambas as Skills.

---

# 7. REGRA DE CORES

Nunca inventar cores.

Antes de adicionar uma cor:

1. Procurar os tokens existentes.
2. Procurar CSS variables.
3. Procurar configuração do Tailwind.
4. Procurar tema global.
5. Procurar componentes existentes.
6. Reutilizar a cor existente.

Se não existir uma cor adequada, não inventar automaticamente.

Perguntar ao utilizador antes de adicionar uma nova cor quando isso alterar a identidade visual.

---

# 8. REGRA DE COMPONENTES

Antes de criar um novo componente:

1. Procurar componentes semelhantes.
2. Verificar se existe um componente reutilizável.
3. Reutilizar o componente existente quando possível.

Não duplicar componentes sem necessidade.

---

# 9. REGRA DE ANIMAÇÃO

Antes de adicionar uma animação:

1. Verificar se já existe uma animação semelhante.
2. Verificar se CSS é suficiente.
3. Se for uma animação complexa, utilizar GSAP.
4. Respeitar o Design System.
5. Garantir responsividade.
6. Garantir performance.
7. Respeitar `prefers-reduced-motion`.

---

# 10. NÃO FAZER REDESIGN AUTOMÁTICO

Se o utilizador pedir:

"Adiciona uma animação aos cards."

O agente NÃO deve:

* mudar as cores
* trocar a fonte
* alterar o layout
* trocar componentes
* criar novos estilos visuais
* adicionar gradientes
* adicionar efeitos neon

a menos que o utilizador peça explicitamente.

---

# 11. PROCESSO OBRIGATÓRIO

Toda tarefa deve seguir:

```text
PEDIDO DO UTILIZADOR
        ↓
ANALISAR TAREFA
        ↓
IDENTIFICAR SKILLS
        ↓
LER SKILLS
        ↓
INSPECIONAR PROJETO
        ↓
PLANEJAR IMPLEMENTAÇÃO
        ↓
IMPLEMENTAR
        ↓
TESTAR
        ↓
VERIFICAR DESIGN SYSTEM
        ↓
VERIFICAR PERFORMANCE
        ↓
CONCLUIR
```

---

# 12. REGRA FINAL

Nunca ignorar uma Skill relevante.

Nunca inventar padrões visuais quando já existem padrões definidos.

Nunca modificar partes não relacionadas com a tarefa.

Sempre preservar o sistema existente antes de adicionar novas funcionalidades.
