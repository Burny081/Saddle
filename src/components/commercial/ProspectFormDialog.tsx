import React, { useState } from 'react';
import { createProspect, Prospect } from '@/utils/apiCommercial';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface ProspectFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (prospect: Prospect) => void;
  storeId: string;
}

export default function ProspectFormDialog({ open, onClose, onSuccess, storeId }: ProspectFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    source: string;
    status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation';
    estimatedValue: string;
    notes: string;
    nextFollowUp: string;
  }>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    source: 'website',
    status: 'new',
    estimatedValue: '',
    notes: '',
    nextFollowUp: ''
  });

  const sources = [
    { value: 'website', label: 'Site web' },
    { value: 'referral', label: 'Recommandation' },
    { value: 'social_media', label: 'Réseaux sociaux' },
    { value: 'cold_call', label: 'Appel à froid' },
    { value: 'event', label: 'Événement/Salon' },
    { value: 'advertising', label: 'Publicité' },
    { value: 'other', label: 'Autre' }
  ];

  const statuses = [
    { value: 'new', label: 'Nouveau' },
    { value: 'contacted', label: 'Contacté' },
    { value: 'qualified', label: 'Qualifié' },
    { value: 'proposal', label: 'Proposition envoyée' },
    { value: 'negotiation', label: 'Négociation' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prospect = await createProspect({
        store_id: storeId,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        source: formData.source,
        status: formData.status,
        estimated_value: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        notes: formData.notes || undefined,
        next_follow_up: formData.nextFollowUp || undefined
      });

      onSuccess(prospect);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du prospect:', error);
      alert('Erreur lors de la création du prospect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau Prospect</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nom de l'entreprise *</Label>
            <Input
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Nom du contact *</Label>
            <Input
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Adresse</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valeur estimée (FCFA)</Label>
              <Input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Prochain suivi</Label>
              <Input
                type="date"
                value={formData.nextFollowUp}
                onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded p-2 min-h-[80px]"
              placeholder="Informations complémentaires..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le prospect'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
