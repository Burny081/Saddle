import { useState, useEffect } from 'react';
import { Percent, Plus, Edit, Trash2, Copy, Check, Calendar, Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import type { PromoCode, DiscountType, PromoStatus } from '@/types/promotions';

export default function PromoCodesView() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<PromoCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PromoStatus>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as DiscountType,
    discountValue: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    usagePerCustomer: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active' as PromoStatus
  });

  // Sample data for demonstration
  useEffect(() => {
    const sampleCodes: PromoCode[] = [
      {
        id: '1',
        code: 'WELCOME10',
        description: 'Réduction de bienvenue pour nouveaux clients',
        discountType: 'percentage',
        discountValue: 10,
        minPurchaseAmount: 50000,
        usageLimit: 100,
        usageCount: 23,
        usagePerCustomer: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        createdBy: 'admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        code: 'SUMMER2024',
        description: 'Promotion d\'été 2024',
        discountType: 'fixed',
        discountValue: 25000,
        minPurchaseAmount: 200000,
        maxDiscountAmount: 50000,
        usageLimit: 50,
        usageCount: 45,
        usagePerCustomer: 2,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        status: 'expired',
        createdBy: 'admin',
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date('2024-05-15')
      },
      {
        id: '3',
        code: 'BOGO50',
        description: 'Achetez-en un, obtenez le deuxième à 50%',
        discountType: 'bogo',
        discountValue: 50,
        usageCount: 12,
        usagePerCustomer: 1,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        createdBy: 'admin',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      }
    ];
    setPromoCodes(sampleCodes);
    setFilteredCodes(sampleCodes);
  }, []);

  // Filter codes
  useEffect(() => {
    let filtered = promoCodes;

    if (searchQuery) {
      filtered = filtered.filter(code =>
        code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(code => code.status === statusFilter);
    }

    setFilteredCodes(filtered);
  }, [searchQuery, statusFilter, promoCodes]);

  const handleSubmit = () => {
    const newPromo: PromoCode = {
      id: editingPromo?.id || `promo-${Date.now()}`,
      ...formData,
      code: formData.code.toUpperCase(),
      minPurchaseAmount: formData.minPurchaseAmount || undefined,
      maxDiscountAmount: formData.maxDiscountAmount || undefined,
      usageLimit: formData.usageLimit || undefined,
      usageCount: editingPromo?.usageCount || 0,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      createdBy: 'admin',
      createdAt: editingPromo?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingPromo) {
      setPromoCodes(prev => prev.map(p => p.id === editingPromo.id ? newPromo : p));
    } else {
      setPromoCodes(prev => [newPromo, ...prev]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minPurchaseAmount: 0,
      maxDiscountAmount: 0,
      usageLimit: 0,
      usagePerCustomer: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    });
    setEditingPromo(null);
    setShowDialog(false);
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minPurchaseAmount: promo.minPurchaseAmount || 0,
      maxDiscountAmount: promo.maxDiscountAmount || 0,
      usageLimit: promo.usageLimit || 0,
      usagePerCustomer: promo.usagePerCustomer || 1,
      startDate: promo.startDate.toISOString().split('T')[0],
      endDate: promo.endDate.toISOString().split('T')[0],
      status: promo.status
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      setPromoCodes(prev => prev.filter(p => p.id !== id));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: PromoStatus) => {
    const variants = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      expired: 'bg-red-100 text-red-700',
      scheduled: 'bg-blue-100 text-blue-700'
    };
    return variants[status];
  };

  const getDiscountLabel = (promo: PromoCode) => {
    switch (promo.discountType) {
      case 'percentage':
        return `${promo.discountValue}% de réduction`;
      case 'fixed':
        return `${promo.discountValue.toLocaleString()} FCFA de réduction`;
      case 'bogo':
        return 'Achetez-en 1, obtenez le 2ème à 50%';
      case 'free_shipping':
        return 'Livraison gratuite';
    }
  };

  const activeCount = promoCodes.filter(p => p.status === 'active').length;
  const totalUsage = promoCodes.reduce((sum, p) => sum + p.usageCount, 0);
  const totalRevenue = promoCodes.reduce((sum, p) => sum + (p.usageCount * (p.discountValue || 0)), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Tag className="h-8 w-8 text-orange-600" />
            Codes Promotionnels
          </h1>
          <p className="text-gray-600 mt-2">Gérez vos promotions et codes de réduction</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau code promo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total codes</p>
                <p className="text-3xl font-bold text-blue-600">{promoCodes.length}</p>
              </div>
              <Tag className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Codes actifs</p>
                <p className="text-3xl font-bold text-green-600">{activeCount}</p>
              </div>
              <Check className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisations</p>
                <p className="text-3xl font-bold text-purple-600">{totalUsage}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réductions</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalRevenue.toLocaleString()} F
                </p>
              </div>
              <Percent className="h-10 w-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="scheduled">Programmé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Promo Codes List */}
      <div className="grid gap-4">
        {filteredCodes.map(promo => (
          <Card key={promo.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <code className="px-4 py-2 bg-orange-50 text-orange-700 font-bold text-lg rounded border-2 border-orange-200 border-dashed">
                        {promo.code}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute -right-2 -top-2 h-6 w-6"
                        onClick={() => copyCode(promo.code)}
                      >
                        {copiedCode === promo.code ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <Badge className={getStatusBadge(promo.status)}>
                      {promo.status}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700">{promo.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      {getDiscountLabel(promo)}
                    </span>
                    {promo.minPurchaseAmount && (
                      <span>Min: {promo.minPurchaseAmount.toLocaleString()} FCFA</span>
                    )}
                    {promo.maxDiscountAmount && (
                      <span>Max: {promo.maxDiscountAmount.toLocaleString()} FCFA</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {promo.startDate.toLocaleDateString('fr-FR')} - {promo.endDate.toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col gap-2 items-end">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {promo.usageCount}
                      {promo.usageLimit && <span className="text-gray-400">/{promo.usageLimit}</span>}
                    </p>
                    <p className="text-xs text-gray-600">utilisations</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(promo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Modifier le code promo' : 'Nouveau code promo'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code promo *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(v: PromoStatus) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="scheduled">Programmé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du code promo..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Type de réduction</Label>
                <Select value={formData.discountType} onValueChange={(v: DiscountType) => setFormData({ ...formData, discountType: v })}>
                  <SelectTrigger id="discountType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                    <SelectItem value="bogo">Buy One Get One</SelectItem>
                    <SelectItem value="free_shipping">Livraison gratuite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Valeur {formData.discountType === 'percentage' ? '(%)' : '(FCFA)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                  min={0}
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Montant minimum (FCFA)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) })}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Réduction max (FCFA)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) })}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Limite d'utilisation totale</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                  min={0}
                  placeholder="Illimité"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usagePerCustomer">Utilisations par client</Label>
                <Input
                  id="usagePerCustomer"
                  type="number"
                  value={formData.usagePerCustomer}
                  onChange={(e) => setFormData({ ...formData, usagePerCustomer: parseInt(e.target.value) })}
                  min={1}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.code || !formData.description}>
              {editingPromo ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
