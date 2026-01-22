# Système de Notification Email

## Vue d'ensemble

Le système de notification email de Saddle Point Service permet d'envoyer automatiquement des emails personnalisés aux clients et à l'équipe lors d'événements importants.

## Fonctionnalités

### 1. Templates d'Emails Intégrés

#### Confirmation de Commande
- **Déclencheur** : Création d'une nouvelle commande/vente
- **Destinataire** : Client
- **Contenu** :
  - Numéro de commande
  - Détails des articles commandés
  - Montant total avec TVA
  - Statut de la commande
  - Lien de suivi

#### Facture
- **Déclencheur** : Paiement d'une vente
- **Destinataire** : Client
- **Contenu** :
  - Numéro de facture
  - Informations client et entreprise
  - Détails des articles avec prix unitaires
  - Sous-total HT, TVA (19.25%), Total TTC
  - Lien de téléchargement PDF

#### Devis
- **Déclencheur** : Création d'un devis
- **Destinataire** : Client
- **Contenu** :
  - Numéro de devis
  - Période de validité
  - Montant total
  - Lien de téléchargement

#### Alerte de Stock
- **Déclencheur** : Stock atteint le niveau minimum
- **Destinataire** : Administrateurs/Managers (configurable)
- **Contenu** :
  - Nom de l'article
  - Stock actuel vs stock minimum
  - Quantité suggérée à commander
  - Lien direct vers la commande

#### Email de Bienvenue
- **Déclencheur** : Création d'un nouveau compte client
- **Destinataire** : Nouveau client
- **Contenu** :
  - Message de bienvenue
  - Présentation des services
  - Lien vers la boutique

## Configuration

### Paramètres SMTP

1. Aller dans **Paramètres > Email**
2. Remplir les informations :
   - **Serveur SMTP** : smtp.gmail.com (ou votre serveur)
   - **Port SMTP** : 587 (TLS) ou 465 (SSL)
   - **Email expéditeur** : noreply@saddlepointservice.com
   - **Nom expéditeur** : Saddle Point Service
   - **Connexion sécurisée (SSL)** : Activé

### Emails Automatiques

Activez/désactivez chaque type d'email :

- ✅ **Confirmation de commande** : Envoi automatique lors de la création d'une vente
- ✅ **Factures par email** : Envoi automatique des factures aux clients
- ✅ **Alertes de stock** : Notifications quand le stock est bas
- ✅ **Email de bienvenue** : Envoi lors de l'inscription d'un nouveau client

### Destinataires des Alertes de Stock

Configurez les emails des administrateurs qui recevront les alertes de stock :
```
admin@example.com, manager@example.com
```

## Intégration

### Envoi Automatique

Le système envoie automatiquement des emails lors de ces événements :

```typescript
// DataContext.tsx

// Lors de la création d'un client
if (emailConfig.enableWelcomeEmail && client.email) {
  await sendWelcomeEmail({
    email: client.email,
    name: client.name,
    shopUrl: window.location.origin
  });
}

// Lors d'une nouvelle vente
if (emailConfig.enableOrderConfirmation && client?.email) {
  await sendOrderConfirmation({
    orderNumber: invoiceNumber,
    clientName: saleData.clientName,
    clientEmail: client.email,
    // ...
  });
}

// Lors du paiement d'une facture
if (emailConfig.enableInvoiceEmail && saleData.paid && client?.email) {
  await sendInvoice({
    invoiceNumber,
    clientName: saleData.clientName,
    clientEmail: client.email,
    // ...
  });
}

// Lors d'un stock bas
if (emailConfig.enableStockAlerts && newStock <= minStock) {
  await sendStockAlert({
    articleName: article.name,
    currentStock: newStock,
    minStock: article.minStock,
    // ...
  }, recipients);
}
```

### Envoi Manuel

Vous pouvez aussi envoyer des emails manuellement :

```typescript
import { sendEmail } from '@/utils/emailService';

// Email personnalisé
await sendEmail({
  to: 'client@example.com',
  subject: 'Sujet de l\'email',
  html: '<h1>Contenu HTML</h1>',
  text: 'Version texte'
});

// Avec template
await sendEmail({
  to: 'client@example.com',
  template: 'order_confirmation',
  data: {
    orderNumber: 'FAC-001',
    clientName: 'John Doe',
    // ...
  }
});
```

## Design des Emails

Tous les emails utilisent un design professionnel avec :

- 📱 **Responsive** : S'adapte à tous les écrans
- 🎨 **Branded** : Gradient rouge-bleu de l'entreprise
- 📧 **Compatible** : Fonctionne sur tous les clients email
- 🔗 **Interactif** : Boutons d'action et liens

### Structure HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #2563eb 100%); }
    .button { background: #2563eb; color: white; padding: 12px 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Titre</h1>
    </div>
    <div class="content">
      <!-- Contenu -->
    </div>
  </div>
</body>
</html>
```

## Production

### Configuration avec Services Externes

Pour la production, intégrez un service d'email professionnel :

#### SendGrid

```typescript
// emailService.ts
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: options.to }]
    }],
    from: { email: 'noreply@saddlepointservice.com' },
    subject: emailContent.subject,
    content: [{
      type: 'text/html',
      value: emailContent.html
    }]
  })
});
```

#### Supabase Edge Functions

```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

serve(async (req) => {
  const { to, subject, html } = await req.json();
  
  const client = new SmtpClient();
  await client.connectTLS({
    hostname: "smtp.gmail.com",
    port: 465,
    username: Deno.env.get("SMTP_USER"),
    password: Deno.env.get("SMTP_PASSWORD"),
  });
  
  await client.send({
    from: "noreply@saddlepointservice.com",
    to,
    subject,
    content: html,
    html: true,
  });
  
  await client.close();
  
  return new Response(JSON.stringify({ success: true }));
});
```

## Mode Développement

En mode développement, les emails sont loggés dans la console au lieu d'être envoyés :

```
📧 Email would be sent:
To: client@example.com
Subject: Confirmation de commande #FAC-001
Preview: Bonjour Client Test, Nous avons bien reçu votre commande...
```

## Tests

### Test d'Email

1. Aller dans **Paramètres > Email > Test**
2. Sélectionner le template à tester
3. Entrer votre email de test
4. Cliquer sur "Envoyer l'email de test"

Le système enverra un email avec des données de démonstration.

## Dépannage

### L'email n'est pas envoyé

1. **Vérifier la configuration SMTP** dans les paramètres
2. **Vérifier que l'email automatique est activé** pour ce type
3. **Vérifier que le client a un email** dans sa fiche
4. **Consulter la console** pour voir les logs d'erreur

### L'email arrive dans les spams

1. **Configurer SPF** et **DKIM** pour votre domaine
2. **Utiliser un service professionnel** (SendGrid, Mailgun)
3. **Éviter les mots spam** dans le sujet
4. **Demander aux clients d'ajouter** votre adresse à leurs contacts

### Limite d'envoi dépassée

- Gmail : 500 emails/jour (compte gratuit)
- SendGrid : 100 emails/jour (plan gratuit)
- **Solution** : Passer à un plan payant ou utiliser plusieurs comptes

## Prochaines Fonctionnalités

- [ ] Éditeur WYSIWYG pour personnaliser les templates
- [ ] Templates multi-langues (FR/EN)
- [ ] Statistiques d'envoi (taux d'ouverture, clics)
- [ ] File d'attente pour les envois en masse
- [ ] Pièces jointes automatiques (PDF factures)
- [ ] Templates conditionnels basés sur le type de client
- [ ] Campagnes marketing par email

## Support

Pour toute question sur le système d'email :
- Documentation : `DOCUMENTATION.md`
- Support : support@saddlepointservice.com
