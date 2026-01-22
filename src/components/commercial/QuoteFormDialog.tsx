import React, { useState } from 'react';
import { createQuote, addQuoteItem, Quote } from '@/utils/apiCommercial';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

interface QuoteFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (quote: Quote) => void;
  storeId: string;
  userId: string;
}

type QuoteItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  total: number;
};

export default function QuoteFormDialog({ open, onClose, onSuccess, storeId, userId }: QuoteFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    validityDate: '',
    notes: '',
    taxRate: 19.25
  });
  const [items, setItems] = useState<QuoteItemInput[]>([
    { description: '', quantity: 1, unitPrice: 0, discountPercent: 0, total: 0 }
  ]);

  const calculateItemTotal = (item: QuoteItemInput) => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = subtotal * (item.discountPercent / 100);
    return subtotal - discount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const discountAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * (item.discountPercent / 100));
    }, 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleItemChange = (index: number, field: keyof QuoteItemInput, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].total = calculateItemTotal(newItems[index]);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, discountPercent: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const generateQuoteNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DEV-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { subtotal, discountAmount, taxAmount, total } = calculateTotals();
      
      // Créer le devis
      const quote = await createQuote({
        quote_number: generateQuoteNumber(),
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_phone: formData.clientPhone,
        store_id: storeId,
        status: 'draft',
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total,
        validity_date: formData.validityDate,
        notes: formData.notes,
        created_by: userId
      });

      // Ajouter les lignes du devis
      for (const item of items) {
        if (item.description && item.quantity > 0) {
          await addQuoteItem({
            quote_id: quote.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount_percent: item.discountPercent,
            total: item.total
          });
        }
      }

      onSuccess(quote);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      alert('Erreur lors de la création du devis');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau Devis</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom du client / Entreprise *</Label>
              <Input
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              />
            </div>
            <div>
              <Label>Date de validité *</Label>
              <Input
                type="date"
                value={formData.validityDate}
                onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Articles */}
          <div>
            <Label className="mb-2 block">Articles / Services</Label>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-center w-16">Qté</th>
                  <th className="p-2 text-right w-28">Prix unit.</th>
                  <th className="p-2 text-center w-20">Remise %</th>
                  <th className="p-2 text-right w-28">Total</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="text-right"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent}
                        onChange={(e) => handleItemChange(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td className="p-2 text-right font-medium">{item.total.toLocaleString()} FCFA</td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button type="button" variant="outline" onClick={addItem} className="mt-2">
              + Ajouter une ligne
            </Button>
          </div>

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total:</span>
                <span>{(subtotal + discountAmount).toLocaleString()} FCFA</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remise totale:</span>
                  <span>-{discountAmount.toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Net HT:</span>
                <span>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA ({formData.taxRate}%):</span>
                <span>{taxAmount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total TTC:</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes / Conditions</Label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded p-2 min-h-[80px]"
              placeholder="Conditions de paiement, délai de livraison, etc."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le devis'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
