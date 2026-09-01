# Design System Skill

## Objetivo

Esta skill define como o agente deve identificar, utilizar e preservar o Design System deste projeto.

O Design System é a fonte de verdade visual.

Nenhuma implementação deve introduzir estilos que entrem em conflito com ele.

---

# 1. Fonte de verdade

Antes de criar qualquer interface, procurar nesta ordem:

```text
1. Design tokens
2. CSS variables
3. Tailwind configuration
4. Theme configuration
5. Component library
6. Componentes existentes
7. Estilos globais
8. Páginas existentes
```

Utilizar os valores encontrados.

Não inventar valores quando já existir um equivalente.

---

# 2. Cores

As cores devem ser provenientes dos tokens existentes.

Exemplo:

```css
:root {
  --primary: ...;
  --secondary: ...;
  --background: ...;
  --foreground: ...;
  --muted: ...;
  --border: ...;
}
```

Utilizar:

```css
background: var(--primary);
```

em vez de:

```css
background: #123456;
```

quando existir um token equivalente.

---

# 3. Regra anti-cor

Nunca adicionar uma cor arbitrária apenas para melhorar visualmente uma seção.

Evitar:

```text
red
blue
purple
green
orange
pink
```

sem que essas cores façam parte do Design System.

Também não criar:

```text
gradientes
glows
neon effects
background colors
border colors
```

que não estejam alinhados com a identidade visual.

---

# 4. Tipografia

Utilizar as fontes já configuradas no projeto.

Verificar:

* font family
* font weight
* font size
* line height
* letter spacing
* heading hierarchy

Não introduzir outra família tipográfica sem autorização.

---

# 5. Espaçamento

Utilizar o sistema de espaçamento existente.

Preferir tokens/classes existentes.

Exemplo:

```text
space-xs
space-sm
space-md
space-lg
space-xl
```

ou o sistema equivalente utilizado pelo projeto.

Não criar valores aleatórios para cada componente.

---

# 6. Border Radius

Respeitar os valores definidos no Design System.

Exemplo:

```css
border-radius: var(--radius-md);
```

Não criar diferentes valores de radius apenas por preferência visual.

---

# 7. Sombras

Utilizar as sombras existentes.

Exemplo:

```css
box-shadow: var(--shadow-md);
```

Não criar sombras excessivamente fortes sem necessidade.

---

# 8. Componentes

Antes de criar:

```text
Button
Card
Input
Modal
Navbar
Dropdown
Badge
Tabs
Accordion
```

procurar primeiro se o projeto já possui esses componentes.

Reutilizar sempre que possível.

---

# 9. Estados

Os componentes devem respeitar os estados existentes:

```text
default
hover
focus
active
disabled
loading
error
success
```

Não criar estilos de estado inconsistentes.

---

# 10. Responsividade

Utilizar os breakpoints existentes.

Não criar novos breakpoints sem necessidade.

A interface deve preservar:

* hierarquia
* legibilidade
* espaçamento
* interação

em todos os tamanhos.

---

# 11. Imagens

Respeitar:

* aspect ratio
* border radius
* object-fit
* posicionamento
* tratamento visual

Não aplicar filtros ou efeitos que alterem a identidade visual sem necessidade.

---

# 12. Ícones

Utilizar a biblioteca de ícones já utilizada pelo projeto.

Não misturar diferentes famílias de ícones sem necessidade.

Manter:

* tamanho
* stroke
* peso
* alinhamento

consistentes.

---

# 13. Animações

As animações também fazem parte do Design System.

Devem respeitar:

* duração
* easing
* intensidade
* direção
* hierarquia visual

Quando uma animação avançada for necessária, utilizar a Skill:

```text
gsap-animation/SKILL.md
```

---

# 14. GSAP e Design System

GSAP nunca pode alterar a identidade visual do projeto.

GSAP deve controlar principalmente:

```text
transform
opacity
position
scale
rotation
clip-path
motion
```

Quando uma animação utilizar cores, deve utilizar os tokens existentes.

---

# 15. Proibição de redesign automático

Se o utilizador pedir:

```text
"Anima esta seção"
```

o agente NÃO deve:

* mudar cores
* trocar fontes
* trocar componentes
* mudar o layout
* adicionar gradientes
* adicionar efeitos neon
* alterar espaçamentos

a menos que isso seja solicitado.

---

# 16. Novos tokens

Se for necessário um novo token:

1. Identificar por que o token é necessário.
2. Verificar se existe um token equivalente.
3. Se não existir, informar o utilizador.
4. Não substituir silenciosamente o Design System.

---

# 17. Checklist

Antes de finalizar:

```text
□ Cores pertencem ao Design System?
□ Tipografia pertence ao Design System?
□ Espaçamentos seguem o sistema?
□ Border radius está consistente?
□ Sombras estão consistentes?
□ Componentes existentes foram reutilizados?
□ Breakpoints existentes foram utilizados?
□ Estados estão consistentes?
□ Nenhuma cor arbitrária foi adicionada?
□ Nenhum redesign não solicitado foi realizado?
```

---

# Regra final

**O Design System vence a preferência pessoal do agente.**

Quando houver dúvida:

```text
Consultar o projeto
      ↓
Encontrar o padrão existente
      ↓
Reutilizar
      ↓
Só criar algo novo se realmente necessário
```
