interface QuoteRequestItem {
  name: string;
  brand: string;
  quantity: number;
}

const QUOTE_EMAIL = 'bongni@saddlepoint.org';

export function createQuoteRequestMailto(items: QuoteRequestItem[]) {
  const products = items.map((item) => `- ${item.name} — ${item.brand} × ${item.quantity}`).join('\n');
  const subject = 'Demande de devis — Catalogue SaddlePoint';
  const body = `Bonjour SaddlePoint Service,\n\nJe souhaite recevoir un devis pour les produits suivants :\n\n${products}\n\nMerci de me contacter pour confirmer la disponibilité et les spécifications.\n\nCordialement,`;

  return `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
