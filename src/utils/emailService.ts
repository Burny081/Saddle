// Email service using Supabase Edge Functions or external service
// For production, you would typically use SendGrid, Mailgun, or similar

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: 'order_confirmation' | 'invoice' | 'quote' | 'stock_alert' | 'welcome';
  data?: Record<string, any>;
}

// Email templates
export const emailTemplates = {
  order_confirmation: (data: any): EmailTemplate => ({
    subject: `Confirmation de commande #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 20px; font-weight: bold; color: #2563eb; margin-top: 20px; text-align: right; }
          .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 12px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Commande Confirmée</h1>
            <p>Merci pour votre commande !</p>
          </div>
          <div class="content">
            <p>Bonjour <strong>${data.clientName}</strong>,</p>
            <p>Nous avons bien reçu votre commande et elle est en cours de traitement.</p>
            
            <div class="order-details">
              <h2>Détails de la commande</h2>
              <p><strong>Numéro de commande:</strong> ${data.orderNumber}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Statut:</strong> ${data.status}</p>
              
              <h3>Articles commandés:</h3>
              ${data.items.map((item: any) => `
                <div class="item">
                  <span>${item.name} x ${item.quantity}</span>
                  <span>${item.total} FCFA</span>
                </div>
              `).join('')}
              
              <div class="total">
                Total: ${data.total} FCFA
              </div>
            </div>
            
            <p>Vous recevrez une notification lorsque votre commande sera prête.</p>
            <p style="text-align: center;">
              <a href="${data.trackingUrl || '#'}" class="button">Suivre ma commande</a>
            </p>
          </div>
          <div class="footer">
            <p>Saddle Point Service</p>
            <p>Pour toute question, contactez-nous à support@saddlepointservice.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Commande confirmée #${data.orderNumber}\n\nMerci pour votre commande, ${data.clientName}!\n\nTotal: ${data.total} FCFA`
  }),

  invoice: (data: any): EmailTemplate => ({
    subject: `Facture #${data.invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
          .invoice { background: white; padding: 30px; border: 2px solid #e5e7eb; }
          .company-info { margin-bottom: 30px; }
          .invoice-details { display: flex; justify-content: space-between; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f3f4f6; padding: 10px; text-align: left; }
          .items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .totals { text-align: right; margin-top: 20px; }
          .totals div { padding: 5px 0; }
          .grand-total { font-size: 24px; font-weight: bold; color: #2563eb; margin-top: 10px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Facture</h1>
          </div>
          <div class="invoice">
            <div class="company-info">
              <h2>Saddle Point Service</h2>
              <p>Yaoundé, Cameroun</p>
              <p>Tél: +237 XXX XXX XXX</p>
            </div>
            
            <div class="invoice-details">
              <div>
                <strong>Facture N°:</strong> ${data.invoiceNumber}<br>
                <strong>Date:</strong> ${data.date}
              </div>
              <div>
                <strong>Client:</strong><br>
                ${data.clientName}<br>
                ${data.clientEmail || ''}<br>
                ${data.clientPhone || ''}
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map((item: any) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price} FCFA</td>
                    <td>${item.total} FCFA</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <div><strong>Sous-total HT:</strong> ${data.subtotal} FCFA</div>
              <div><strong>TVA (19.25%):</strong> ${data.tax} FCFA</div>
              <div class="grand-total">TOTAL TTC: ${data.total} FCFA</div>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${data.downloadUrl || '#'}" class="button">Télécharger la facture PDF</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Facture #${data.invoiceNumber}\n\nClient: ${data.clientName}\nTotal: ${data.total} FCFA`
  }),

  quote: (data: any): EmailTemplate => ({
    subject: `Devis #${data.quoteNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .validity { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Devis</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${data.clientName}</strong>,</p>
            <p>Voici votre devis personnalisé.</p>
            
            <div class="validity">
              <strong>⏰ Validité:</strong> ${data.validityDays} jours à partir du ${data.date}
            </div>
            
            <p><strong>Montant total:</strong> ${data.total} FCFA</p>
            
            <p style="text-align: center;">
              <a href="${data.downloadUrl || '#'}" class="button">Télécharger le devis</a>
            </p>
            
            <p>N'hésitez pas à nous contacter pour toute question.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Devis #${data.quoteNumber}\n\nClient: ${data.clientName}\nTotal: ${data.total} FCFA\nValidité: ${data.validityDays} jours`
  }),

  stock_alert: (data: any): EmailTemplate => ({
    subject: `⚠️ Alerte stock: ${data.articleName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; }
          .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Alerte Stock Bas</h1>
          </div>
          <div class="alert">
            <h2>${data.articleName}</h2>
            <p><strong>Stock actuel:</strong> ${data.currentStock} ${data.unit}</p>
            <p><strong>Stock minimum:</strong> ${data.minStock} ${data.unit}</p>
            <p><strong>Commande suggérée:</strong> ${data.suggestedOrder} ${data.unit}</p>
          </div>
          <p style="text-align: center;">
            <a href="${data.orderUrl || '#'}" class="button">Commander maintenant</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `Alerte stock: ${data.articleName}\nStock actuel: ${data.currentStock}\nStock minimum: ${data.minStock}`
  }),

  welcome: (data: any): EmailTemplate => ({
    subject: 'Bienvenue chez Saddle Point Service',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #2563eb 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .feature { background: white; padding: 15px; border-radius: 8px; text-align: center; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue !</h1>
            <p>Merci de nous avoir rejoints</p>
          </div>
          <div class="content">
            <p>Bonjour <strong>${data.name}</strong>,</p>
            <p>Bienvenue chez Saddle Point Service ! Nous sommes ravis de vous compter parmi nos clients.</p>
            
            <div class="features">
              <div class="feature">
                <h3>🛍️</h3>
                <p>Boutique en ligne</p>
              </div>
              <div class="feature">
                <h3>📦</h3>
                <p>Suivi de commandes</p>
              </div>
              <div class="feature">
                <h3>💰</h3>
                <p>Prix compétitifs</p>
              </div>
              <div class="feature">
                <h3>🚀</h3>
                <p>Livraison rapide</p>
              </div>
            </div>
            
            <p style="text-align: center;">
              <a href="${data.shopUrl || '#'}" class="button">Commencer mes achats</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Bienvenue chez Saddle Point Service, ${data.name}!`
  })
};

// Main email sending function
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    let emailContent: EmailTemplate;

    if (options.template && options.data) {
      // Use template
      const templateFunction = emailTemplates[options.template];
      emailContent = templateFunction(options.data);
    } else {
      // Use custom content
      emailContent = {
        subject: options.subject,
        html: options.html || '',
        text: options.text || ''
      };
    }

    // In production, integrate with your email service
    // Example with Supabase Edge Function:
    /*
    const response = await fetch('https://your-project.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        to: options.to,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })
    });

    return response.ok;
    */

    // For development/demo: Log to console
    console.log('📧 Email would be sent:');
    console.log('To:', options.to);
    console.log('Subject:', emailContent.subject);
    console.log('Preview:', emailContent.text?.substring(0, 100));

    // Simulate success
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Helper functions
export async function sendOrderConfirmation(orderData: any) {
  return sendEmail({
    to: orderData.clientEmail,
    template: 'order_confirmation',
    subject: '', // Will be overridden by template
    data: orderData
  });
}

export async function sendInvoice(invoiceData: any) {
  return sendEmail({
    to: invoiceData.clientEmail,
    template: 'invoice',
    subject: '', // Will be overridden by template
    data: invoiceData
  });
}

export async function sendQuote(quoteData: any) {
  return sendEmail({
    to: quoteData.clientEmail,
    template: 'quote',
    subject: '', // Will be overridden by template
    data: quoteData
  });
}

export async function sendStockAlert(alertData: any, recipients: string[]) {
  const promises = recipients.map(email =>
    sendEmail({
      to: email,
      template: 'stock_alert',
      subject: '', // Will be overridden by template
      data: alertData
    })
  );
  
  const results = await Promise.all(promises);
  return results.every(result => result === true);
}

export async function sendWelcomeEmail(userData: any) {
  return sendEmail({
    to: userData.email,
    template: 'welcome',
    subject: '', // Will be overridden by template
    data: userData
  });
}
