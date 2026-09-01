# GSAP Animation Skill

## Objetivo

Esta skill define como criar animações profissionais utilizando GSAP.

GSAP deve ser utilizado para melhorar a experiência do utilizador, e não simplesmente para adicionar efeitos visuais.

---

# 1. Regra máxima

Antes de criar qualquer animação:

```text
1. Ler PROJECT RULES.
2. Ler DESIGN SYSTEM.
3. Inspecionar o componente.
4. Identificar os padrões de animação existentes.
5. Verificar se CSS é suficiente.
6. Utilizar GSAP apenas quando oferecer uma vantagem real.
```

---

# 2. Design System é obrigatório

Toda animação GSAP deve respeitar o Design System.

Nunca alterar:

- cores
- tipografia
- spacing
- radius
- componentes
- identidade visual

apenas para criar uma animação.

---

# 3. Não inventar cores

Se a animação precisar trabalhar com cores:

Utilizar os tokens existentes.

Exemplo:

```javascript
gsap.to(element, {
  backgroundColor: "var(--primary)",
});
```

Não criar:

```javascript
backgroundColor: "#ff00ff";
```

sem que essa cor faça parte do projeto.

---

# 4. Escolher a tecnologia correta

Antes de utilizar GSAP:

```text
Hover simples?
→ CSS

Fade simples?
→ CSS pode ser suficiente

Entrada sequencial?
→ GSAP Timeline

Scroll animation?
→ GSAP ScrollTrigger

Parallax?
→ GSAP + ScrollTrigger

Interação complexa?
→ GSAP

Movimento sincronizado?
→ GSAP Timeline
```

Não utilizar GSAP quando CSS resolver corretamente.

---

# 5. Instalação

Se GSAP ainda não estiver instalado:

```bash
npm install gsap @gsap/react
```

Não instalar novamente se já existir.

---

# 6. React / Next.js

Quando trabalhar com React ou Next.js, preferir:

```javascript
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
```

Exemplo:

```javascript
"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Hero() {
  useGSAP(() => {
    gsap.from(".hero-title", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  });

  return (
    <section>
      <h1 className="hero-title">Título</h1>
    </section>
  );
}
```

---

# 7. Refs

Quando apropriado, utilizar refs para controlar elementos.

Exemplo:

```javascript
const container = useRef(null);

useGSAP(
  () => {
    gsap.from(".title", {
      y: 50,
      opacity: 0,
    });
  },
  { scope: container },
);
```

Evitar seletores globais quando houver risco de afetar outros componentes.

---

# 8. Timeline

Para sequências, utilizar Timeline.

Exemplo:

```javascript
const tl = gsap.timeline();

tl.from(".title", {
  y: 50,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
})
  .from(
    ".description",
    {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    },
    "-=0.4",
  )
  .from(
    ".button",
    {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    },
    "-=0.3",
  );
```

---

# 9. ScrollTrigger

Utilizar ScrollTrigger para animações controladas por scroll.

Exemplo:

```javascript
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

Depois:

```javascript
gsap.from(".card", {
  y: 60,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".card",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});
```

---

# 10. Performance

Priorizar propriedades como:

```text
x
y
xPercent
yPercent
scale
rotation
opacity
```

Evitar animações frequentes de propriedades que provoquem layout/reflow.

Não criar centenas de animações independentes.

---

# 11. Easing

Utilizar easing coerente.

Entradas:

```javascript
ease: "power3.out";
```

Movimentos suaves:

```javascript
ease: "power2.inOut";
```

Pequeno impacto:

```javascript
ease: "back.out(1.7)";
```

Não exagerar no bounce.

---

# 12. Duração

Valores de referência:

```text
Micro interaction: 0.2 – 0.4s
Element entrance: 0.4 – 0.8s
Section animation: 0.6 – 1.2s
Hero sequence: 1 – 2s
```

A duração deve ser ajustada ao contexto.

---

# 13. Hero Animation

Para Hero, preferir uma sequência:

```text
Background
    ↓
Eyebrow
    ↓
Headline
    ↓
Description
    ↓
CTA
```

Exemplo:

```javascript
const tl = gsap.timeline();

tl.from(".hero-eyebrow", {
  y: 20,
  opacity: 0,
  duration: 0.5,
})
  .from(
    ".hero-title",
    {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    },
    "-=0.2",
  )
  .from(
    ".hero-description",
    {
      y: 30,
      opacity: 0,
      duration: 0.6,
    },
    "-=0.4",
  )
  .from(
    ".hero-button",
    {
      y: 20,
      opacity: 0,
      duration: 0.5,
    },
    "-=0.3",
  );
```

---

# 14. Stagger

Para listas ou cards:

```javascript
gsap.from(".card", {
  y: 40,
  opacity: 0,
  duration: 0.6,
  stagger: 0.1,
  ease: "power2.out",
});
```

Não utilizar stagger exagerado.

---

# 15. Responsividade

Utilizar `gsap.matchMedia()` quando necessário.

Exemplo:

```javascript
const mm = gsap.matchMedia();

mm.add("(min-width: 768px)", () => {
  // desktop
});

mm.add("(max-width: 767px)", () => {
  // mobile
});
```

As animações mobile devem ser mais leves quando necessário.

---

# 16. Reduced Motion

Respeitar:

```css
@media (prefers-reduced-motion: reduce) {
}
```

Ou utilizar lógica equivalente no JavaScript.

Para utilizadores que preferem reduzir movimento:

- reduzir deslocamentos
- remover parallax
- reduzir duração
- evitar movimentos contínuos

---

# 17. Cleanup

Não deixar ScrollTriggers ou animações ativas depois do componente ser desmontado.

Em React, preferir `useGSAP`, que fornece contexto apropriado para cleanup.

---

# 18. Interações

Para hover simples:

```css
transition
```

pode ser suficiente.

GSAP deve ser utilizado quando houver:

- múltiplas propriedades
- sequência
- interação complexa
- movimento personalizado
- sincronização
- estado avançado

---

# 19. Proibição de animação excessiva

Evitar automaticamente:

```text
rotations exageradas
zoom exagerado
parallax extremo
bounce excessivo
flashing
glow excessivo
movimento infinito
efeitos aleatórios
```

A interface deve parecer:

```text
Premium
Moderna
Fluida
Profissional
Elegante
```

e não um conjunto de efeitos.

---

# 20. Não alterar layout

Quando o pedido for apenas animação:

Não alterar:

- HTML estrutural
- cores
- tipografia
- spacing
- componentes
- layout

sem necessidade.

---

# 21. Animações existentes

Antes de criar uma nova animação:

Pesquisar no projeto por:

```text
gsap
ScrollTrigger
timeline
useGSAP
motion
animation
transition
```

Reutilizar padrões existentes.

Não criar diferentes sistemas de animação para a mesma aplicação sem necessidade.

---

# 22. Debug

Depois de implementar:

Verificar:

```text
□ Console
□ TypeScript
□ Build
□ Mobile
□ Desktop
□ Scroll
□ Resize
□ Reduced motion
□ Performance
```

---

# 23. Processo obrigatório

Para cada pedido de animação:

```text
PEDIDO
  ↓
ANALISAR COMPONENTE
  ↓
LER DESIGN SYSTEM
  ↓
VERIFICAR ANIMAÇÕES EXISTENTES
  ↓
CSS OU GSAP?
  ↓
ESCOLHER ESTRATÉGIA
  ↓
IMPLEMENTAR
  ↓
RESPONSIVIDADE
  ↓
ACCESSIBILITY
  ↓
PERFORMANCE
  ↓
TESTAR
```

---

# 24. Regra final

GSAP é uma ferramenta de precisão.

Não adicionar animações apenas para tornar a interface "mais chamativa".

A prioridade deve ser:

```text
Design
   ↓
UX
   ↓
Fluidez
   ↓
Performance
   ↓
Acessibilidade
   ↓
Complexidade
```

Se uma solução simples for suficiente, utilizar a solução simples.

Se uma animação avançada for necessária, utilizar GSAP de forma estruturada e profissional.
