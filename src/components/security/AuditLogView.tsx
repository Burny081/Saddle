import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';

export type AuditEventType = 
  | 'login' | 'logout' | 'create' | 'update' | 'delete' 
  | 'export' | 'import' | 'permission_change' | 'settings_change' | 'failed_login';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'success';

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  eventType: AuditEventType;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: AuditSeverity;
  status: 'success' | 'failed';
}

export default function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AuditEventType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<AuditSeverity | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    // Sample audit logs - in production, fetch from API
    const sampleLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: new Date(),
        userId: '1',
        userName: 'Admin User',
        userRole: 'superadmin',
        eventType: 'create',
        action: 'Création d\'un nouveau client',
        resourceType: 'client',
        resourceId: 'CLT-2024-001',
        details: 'Client "ABC Corp" créé avec succès',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        severity: 'success',
        status: 'success'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        userId: '2',
        userName: 'John Doe',
        userRole: 'commercial',
        eventType: 'update',
        action: 'Modification d\'une facture',
        resourceType: 'invoice',
        resourceId: 'INV-2024-045',
        details: 'Montant modifié de 150,000 FCFA à 175,000 FCFA',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
        severity: 'warning',
        status: 'success'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        userId: '3',
        userName: 'Jane Smith',
        userRole: 'comptable',
        eventType: 'export',
        action: 'Export de données comptables',
        resourceType: 'report',
        details: 'Export du bilan mensuel (Décembre 2024) en PDF',
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Firefox/121.0',
        severity: 'info',
        status: 'success'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        userId: 'unknown',
        userName: 'Utilisateur inconnu',
        userRole: 'unknown',
        eventType: 'failed_login',
        action: 'Tentative de connexion échouée',
        details: 'Email: test@example.com - Mot de passe incorrect (3ème tentative)',
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        severity: 'error',
        status: 'failed'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        userId: '1',
        userName: 'Admin User',
        userRole: 'superadmin',
        eventType: 'permission_change',
        action: 'Modification des permissions utilisateur',
        resourceType: 'user',
        resourceId: 'USR-2024-012',
        details: 'Utilisateur "Marc Dupont" promu de "vendeur" à "commercial"',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        severity: 'warning',
        status: 'success'
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        userId: '4',
        userName: 'Stock Manager',
        userRole: 'stockiste',
        eventType: 'delete',
        action: 'Suppression d\'un article',
        resourceType: 'article',
        resourceId: 'ART-2024-089',
        details: 'Article "Produit obsolète XYZ" supprimé du catalogue',
        ipAddress: '192.168.1.115',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        severity: 'warning',
        status: 'success'
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        userId: '1',
        userName: 'Admin User',
        userRole: 'superadmin',
        eventType: 'settings_change',
        action: 'Modification des paramètres système',
        details: 'Activation de l\'authentification à deux facteurs pour tous les utilisateurs',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        severity: 'info',
        status: 'success'
      },
      {
        id: '8',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        userId: '2',
        userName: 'John Doe',
        userRole: 'commercial',
        eventType: 'create',
        action: 'Création d\'un devis',
        resourceType: 'quote',
        resourceId: 'QUO-2024-156',
        details: 'Devis de 450,000 FCFA pour "XYZ Corporation"',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
        severity: 'success',
        status: 'success'
      }
    ];
    setLogs(sampleLogs);
    setFilteredLogs(sampleLogs);
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm) ||
        log.resourceId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Event type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.eventType === filterType);
    }

    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === filterSeverity);
    }

    // Date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(log => log.timestamp >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => log.timestamp <= endDate);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, filterType, filterSeverity, dateRange, logs]);

  const getSeverityColor = (severity: AuditSeverity) => {
    switch (severity) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'info': return 'bg-blue-100 text-blue-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityIcon = (severity: AuditSeverity) => {
    switch (severity) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type: AuditEventType) => {
    const labels: Record<AuditEventType, string> = {
      login: 'Connexion',
      logout: 'Déconnexion',
      create: 'Création',
      update: 'Modification',
      delete: 'Suppression',
      export: 'Export',
      import: 'Import',
      permission_change: 'Permissions',
      settings_change: 'Paramètres',
      failed_login: 'Connexion échouée'
    };
    return labels[type] || type;
  };

  const handleExport = () => {
    // In production, this would generate a CSV/PDF export
    alert('Export en cours... Cette fonctionnalité sera disponible prochainement.');
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    return date.toLocaleString('fr-FR');
  };

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.severity === 'success').length,
    warnings: logs.filter(l => l.severity === 'warning').length,
    errors: logs.filter(l => l.severity === 'error').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Journal d'Audit
          </h2>
          <p className="text-gray-600 mt-1">
            Consultez l'historique complet des actions effectuées dans le système
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total événements</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Succès</p>
              <p className="text-3xl font-bold text-green-600">{stats.success}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Avertissements</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.warnings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Erreurs</p>
              <p className="text-3xl font-bold text-red-600">{stats.errors}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as AuditEventType | 'all')}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="all">Tous les types</option>
              <option value="login">Connexion</option>
              <option value="logout">Déconnexion</option>
              <option value="create">Création</option>
              <option value="update">Modification</option>
              <option value="delete">Suppression</option>
              <option value="export">Export</option>
              <option value="import">Import</option>
              <option value="permission_change">Permissions</option>
              <option value="settings_change">Paramètres</option>
              <option value="failed_login">Connexion échouée</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as AuditSeverity | 'all')}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="all">Toutes les sévérités</option>
              <option value="success">Succès</option>
              <option value="info">Information</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
            </select>

            <div className="flex gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                placeholder="Date début"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                placeholder="Date fin"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sévérité
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimeAgo(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.userRole}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">
                        {getEventTypeLabel(log.eventType)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.action}
                      {log.resourceId && (
                        <div className="text-xs text-gray-500 mt-1">ID: {log.resourceId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                      <div className="truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getSeverityColor(log.severity)}>
                        {getSeverityIcon(log.severity)}
                        <span className="ml-1 capitalize">{log.severity}</span>
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aucun événement trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
