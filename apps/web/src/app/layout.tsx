import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Trauner — Venda qualquer coisa. Em qualquer lugar.', template: '%s · Trauner' },
  description: 'Plataforma completa para criar loja, vender produtos, cursos, serviços e assinaturas.',
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  openGraph: { title: 'Trauner', description: 'Infraestrutura de vendas para Angola e o mundo.' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Outfit:wght@300;400;500;600;700&display=swap" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
