"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function CardReveal({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const revealCards = () => {
        const cards = gsap.utils
          .toArray<HTMLElement>(".card", root.current)
          .filter((card) => !card.dataset.gsapCardReveal);

        cards.forEach((card) => {
          card.dataset.gsapCardReveal = "true";
          gsap.fromTo(
            card,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.65,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            },
          );
        });

        if (cards.length) requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      revealCards();
      const observer = new MutationObserver(revealCards);
      observer.observe(root.current as Node, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="contents">
      {children}
    </div>
  );
}
