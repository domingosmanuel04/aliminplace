import Legal from '@/components/legal';
export default function Page() {
  return <Legal title="Privacidade">A Trauner trata dados de conta, pedidos e analytics da loja com isolamento multi-tenant. Palavras-passe são hashed com Argon2. Dados de cartão nunca são armazenados — apenas tokens do gateway.</Legal>;
}
