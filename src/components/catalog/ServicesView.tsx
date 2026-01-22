import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Briefcase,
  Clock,
  CheckCircle,
  ArrowLeft,
  Settings,
  Filter,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { ServiceFormDialog } from './ServiceFormDialog';
import { CategoryManager, useCategories, getCategoryById } from './CategoryManager';
import type { Service } from '@/types/compatibility';
import { formatCurrency } from '@/config/constants';

interface ServicesViewProps {
  onBack?: () => void;
}

export function ServicesView({ onBack }: ServicesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { user } = useAuth();
  const { t } = useLanguage();
  const { services, addService, updateService, deleteService } = useData();
  const serviceCategories = useCategories('service');

  const canEdit = user && ['superadmin', 'admin'].includes(user.role);

  // Legacy categories from services (for backwards compatibility)
  const legacyCategories = Array.from(new Set(services.map((s) => s.category)));
  // Merge with managed categories
  const formCategories = [...new Set([...legacyCategories, ...serviceCategories.map(c => c.name)])];

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Match by category - check both category name and managed category
    let matchesCategory = !selectedCategory;
    if (selectedCategory) {
      const managedCategory = getCategoryById(selectedCategory);
      if (managedCategory) {
        matchesCategory = service.category === managedCategory.name;
      } else {
        matchesCategory = service.category === selectedCategory;
      }
    }

    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingService(undefined);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setShowDetailsDialog(true);
  };

  const handleSubmit = (data: Omit<Service, 'id'>) => {
    if (editingService) {
      updateService(editingService.id, data);
    } else {
      addService(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-10 w-10"
              aria-label={t('action.backToDashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{t('services.title')}</h1>
            <p className="mt-1 text-muted-foreground">
              {t('services.subtitle')}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('services.newService')}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('services.totalServices')}</p>
                <p className="mt-1 text-3xl font-bold">{services.length}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Stat (Replaced Active Services for simplicity if status is not tracked strictly) */}
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('nav.categories')}</p>
                <p className="mt-1 text-3xl font-bold">{formCategories.length}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 text-white">
                <Filter className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder Stat or other metric */}
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('services.title')}</p>
                <p className="mt-1 text-3xl font-bold">{t('services.availableStatus')}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 text-white">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={t('catalog.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <CategoryManager
              type="service"
              compact
              selectedCategoryId={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            {canEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className="flex-shrink-0"
                title={t('categories.manage')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Manager Panel */}
      {showCategoryManager && canEdit && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <CategoryManager type="service" />
        </motion.div>
      )}

      {/* Services grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group overflow-hidden border-none shadow-lg transition-all hover:shadow-2xl">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category */}
                <div className="absolute left-4 top-4">
                  <Badge className="bg-gradient-to-r from-red-500 to-blue-600 text-white">
                    {service.category}
                  </Badge>
                </div>

                {/* Duration */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-semibold">{service.duration}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="mb-3 text-xl font-bold line-clamp-1">{service.name}</h3>
                <p className="mb-6 text-sm text-slate-600 line-clamp-3 dark:text-slate-400">
                  {service.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(service)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t('label.details')}
                  </Button>
                  {canEdit && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(t('confirm.deleteService'))) {
                            deleteService(service.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Client action */}
                {user?.role === 'client' && (
                  <Button 
                    className="mt-3 w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white"
                    onClick={() => handleViewDetails(service)}
                  >
                    {t('services.requestQuote')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card className="border-none p-12 text-center shadow-lg">
          <Briefcase className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h3 className="mb-2 text-xl font-semibold">{t('services.noServicesFound')}</h3>
          <p className="text-slate-600 dark:text-slate-400">
            {t('services.noServicesFoundHint')}
          </p>
        </Card>
      )}

      {/* Form Dialog */}
      <ServiceFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingService}
        categories={formCategories}
      />

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('services.serviceDetails')}</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <h3 className="text-xl font-bold mb-2">{selectedService.name}</h3>
                  <Badge className="mb-4">{selectedService.category}</Badge>
                  <p className="text-sm text-muted-foreground mb-4">{selectedService.description}</p>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-sm text-muted-foreground">{t('label.price')}</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(selectedService.price)}</span>
                  </div>
                  {selectedService.duration && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t('services.duration')}: {selectedService.duration}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              {user?.role === 'client' && (
                <Button className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white">
                  {t('services.requestQuoteNow')}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
