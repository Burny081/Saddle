import { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Users,
    Mail,
    Phone,
    MapPin,
    Building,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ClientFormDialog } from './ClientFormDialog';
import type { Client } from '@/types/compatibility';
import { formatCurrency } from '@/config/constants';

interface ClientsViewProps {
    initialCreate?: boolean;
    onBack?: () => void;
}

export function ClientsView({ initialCreate = false, onBack }: ClientsViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(initialCreate);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

    const { user } = useAuth();
    const { clients, addClient, updateClient, deleteClient } = useData();
    const { t } = useLanguage();

    const canEdit = user && ['superadmin', 'admin', 'commercial', 'secretaire'].includes(user.role);

    const filteredClients = useMemo(() => clients.filter((client) => {
        const query = searchQuery.toLowerCase();
        return client.name.toLowerCase().includes(query) ||
            (client.email || '').toLowerCase().includes(query) ||
            (client.phone || '').includes(searchQuery);
    }), [clients, searchQuery]);

    const handleOpenCreate = useCallback(() => {
        setEditingClient(undefined);
        setIsDialogOpen(true);
    }, []);

    const handleOpenEdit = useCallback((client: Client) => {
        setEditingClient(client);
        setIsDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setIsDialogOpen(false);
        setEditingClient(undefined);
    }, []);

    const handleSubmit = useCallback((data: Omit<Client, 'id' | 'totalSpent'>) => {
        if (editingClient) {
            updateClient(editingClient.id, data);
        } else {
            addClient(data);
        }
        handleCloseDialog();
    }, [editingClient, updateClient, addClient, handleCloseDialog]);

    const handleDelete = useCallback((id: string) => {
        if (window.confirm(t('confirm.deleteClient'))) {
            deleteClient(id);
        }
    }, [deleteClient, t]);

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
                        <h1 className="text-3xl font-bold">{t('clients.title')}</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {t('clients.subtitle')}
                        </p>
                    </div>
                </div>
                {canEdit && (
                    <Button
                        type="button"
                        onClick={handleOpenCreate}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('clients.newClient')}
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{t('clients.totalClients')}</p>
                                <p className="mt-1 text-3xl font-bold">{clients.length}</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 text-white">
                                <Users className="h-6 w-6" aria-hidden="true" />
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
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                            <Input
                                placeholder={t('placeholder.searchClient')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                                aria-label={t('action.search')}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredClients.map((client, index) => (
                    <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="group border-none shadow-lg transition-all hover:shadow-xl">
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                            <Building className="h-6 w-6" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{client.name}</h3>
                                            <p className="text-sm text-slate-500">ID: {client.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    {canEdit && (
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(client)}
                                                aria-label={`${t('action.edit')} ${client.name}`}
                                            >
                                                <Edit className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(client.id)}
                                                aria-label={`${t('action.delete')} ${client.name}`}
                                            >
                                                <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Mail className="h-4 w-4" aria-hidden="true" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Phone className="h-4 w-4" aria-hidden="true" />
                                        <span>{client.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin className="h-4 w-4" aria-hidden="true" />
                                        <span className="truncate">{client.address}</span>
                                    </div>
                                </div>

                                <div className="mt-6 border-t pt-4 dark:border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">{t('label.total')}</span>
                                        <span className="font-bold text-lg">{formatCurrency(client.totalSpent)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" aria-hidden="true" />
                    <p className="text-slate-500">{t('empty.noResults')}</p>
                </div>
            )}

            <ClientFormDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                initialData={editingClient}
            />
        </div>
    );
}
