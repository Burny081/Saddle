import React, { useState } from 'react';
import { createCashJournalEntry, CashJournalEntry } from '@/utils/apiComptable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface CashJournalFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (entry: CashJournalEntry) => void;
  storeId: string;
  userId: string;
}

export default function CashJournalFormDialog({ open, onClose, onSuccess, storeId, userId }: CashJournalFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    reference: '',
    journalDate: new Date().toISOString().split('T')[0]
  });

  const incomeCategories = [
    'Vente produit',
    'Vente service',
    'Encaissement client',
    'Remboursement fournisseur',
    'Autre entrée'
  ];

  const expenseCategories = [
    'Achat marchandises',
    'Fournitures bureau',
    'Frais de transport',
    'Loyer',
    'Électricité',
    'Eau',
    'Téléphone/Internet',
    'Salaires',
    'Frais bancaires',
    'Taxes',
    'Publicité',
    'Entretien',
    'Autre dépense'
  ];

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const entry = await createCashJournalEntry({
        store_id: storeId,
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        reference: formData.reference || undefined,
        journal_date: formData.journalDate,
        created_by: userId
      });

      onSuccess(entry);
      onClose();
      // Reset form
      setFormData({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        reference: '',
        journalDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle écriture de caisse</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type d'opération *</Label>
            <div className="flex gap-4 mt-2">
              <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${formData.type === 'income' ? 'bg-green-100 border-green-500' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={() => setFormData({ ...formData, type: 'income', category: '' })}
                  className="sr-only"
                />
                <div className="text-2xl mb-1">💰</div>
                <div className="font-medium text-green-700">Entrée</div>
              </label>
              <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${formData.type === 'expense' ? 'bg-red-100 border-red-500' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={() => setFormData({ ...formData, type: 'expense', category: '' })}
                  className="sr-only"
                />
                <div className="text-2xl mb-1">💸</div>
                <div className="font-medium text-red-700">Sortie</div>
              </label>
            </div>
          </div>

          <div>
            <Label>Catégorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Montant (FCFA) *</Label>
              <Input
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="text-lg font-bold"
              />
            </div>
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.journalDate}
                onChange={(e) => setFormData({ ...formData, journalDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Description *</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'opération"
              required
            />
          </div>

          <div>
            <Label>Référence</Label>
            <Input
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="N° facture, reçu, etc."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
