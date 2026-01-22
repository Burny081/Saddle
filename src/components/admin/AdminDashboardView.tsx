import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    ListTodo,
    FileText,
    HelpCircle,
    Bell,
    History,
    Plus,
    Check,
    Clock,
    AlertCircle,
    Loader2,
    Search,
    MoreVertical,
    Trash2,
    Eye,
    Download,
    Users,
    Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as AdminAPI from '@/utils/apiAdmin';

interface AdminDashboardViewProps {
    onBack?: () => void;
}

// Dashboard stats type
interface DashboardStats {
    openTickets: number;
    pendingTasks: number;
    unreadNotifications: number;
    recentAuditLogs: number;
    totalDocuments: number;
    activeUsers?: number;
}

export function AdminDashboardView({ onBack }: AdminDashboardViewProps) {
    const { user } = useAuth();
    const { t } = useLanguage();
    
    // State
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('tasks');
    
    // Data from API
    const [tasks, setTasks] = useState<AdminAPI.Task[]>([]);
    const [documents, setDocuments] = useState<AdminAPI.Document[]>([]);
    const [supportTickets, setSupportTickets] = useState<AdminAPI.SupportTicket[]>([]);
    const [notifications, setNotifications] = useState<AdminAPI.Notification[]>([]);
    const [auditLogs, setAuditLogs] = useState<AdminAPI.AuditLog[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    
    // Dialogs
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
    
    // Search
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form data
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        due_date: '',
        assigned_to: '',
    });
    
    const [documentForm, setDocumentForm] = useState({
        name: '',
        type: 'contract' as 'invoice' | 'quote' | 'contract' | 'report' | 'other',
        description: '',
    });
    
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        category: 'general' as 'bug' | 'feature' | 'support' | 'billing' | 'general',
    });
    
    // Load all data
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tasksData, docsData, ticketsData, notificationsData, logsData, stats] = await Promise.all([
                AdminAPI.getTasks(),
                AdminAPI.getDocuments(),
                AdminAPI.getSupportTickets(),
                user ? AdminAPI.getNotifications(user.id) : Promise.resolve([]),
                AdminAPI.getAuditLogs({ limit: 50 }),
                AdminAPI.getAdminDashboardStats(),
            ]);
            
            setTasks(tasksData);
            setDocuments(docsData);
            setSupportTickets(ticketsData);
            setNotifications(notificationsData);
            setAuditLogs(logsData);
            setDashboardStats(stats);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);
    
    useEffect(() => {
        loadData();
    }, [loadData]);
    
    // Task handlers
    const handleCreateTask = async () => {
        if (!taskForm.title.trim() || !user) return;
        setIsProcessing(true);
        try {
            await AdminAPI.createTask({
                title: taskForm.title,
                description: taskForm.description || undefined,
                priority: taskForm.priority,
                due_date: taskForm.due_date || undefined,
                assigned_to: taskForm.assigned_to || user.id,
            });
            await loadData();
            setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
            setIsTaskDialogOpen(false);
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleUpdateTaskStatus = async (taskId: string, status: 'todo' | 'in_progress' | 'done' | 'cancelled') => {
        setIsProcessing(true);
        try {
            await AdminAPI.updateTask(taskId, { status });
            await loadData();
        } catch (error) {
            console.error('Error updating task:', error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDeleteTask = async (taskId: string) => {
        if (!confirm(t('action.confirmDelete'))) return;
        setIsProcessing(true);
        try {
            await AdminAPI.deleteTask(taskId);
            await loadData();
        } catch (error) {
            console.error('Error deleting task:', error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    // Document handlers
    const handleCreateDocument = async () => {
        if (!documentForm.name.trim() || !user) return;
        setIsProcessing(true);
        try {
            await AdminAPI.uploadDocument({
                name: documentForm.name,
                type: documentForm.type,
                description: documentForm.description || undefined,
                uploaded_by: user.id,
                url: '', // Would be set after file upload
                file_size: 0,
            });
            await loadData();
            setDocumentForm({ name: '', type: 'contract', description: '' });
            setIsDocumentDialogOpen(false);
        } catch (error) {
            console.error('Error creating document:', error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    // Ticket handlers
    const handleCreateTicket = async () => {
        if (!ticketForm.subject.trim() || !user) return;
        setIsProcessing(true);
        try {
            await AdminAPI.createSupportTicket({
                subject: ticketForm.subject,
                message: ticketForm.description,
                priority: ticketForm.priority,
                category: ticketForm.category,
                user_id: user.id,
            });
            await loadData();
            setTicketForm({ subject: '', description: '', priority: 'medium', category: 'general' });
            setIsTicketDialogOpen(false);
        } catch (error) {
            console.error('Error creating ticket:', error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleUpdateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
        setIsProcessing(true);
        try {
            await AdminAPI.updateSupportTicket(ticketId, { status });
            await loadData();
        } catch (error) {
            console.error('Error updating ticket:', error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    // Helper functions
    const getTaskStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            todo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            done: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        };
        const icons: Record<string, React.ReactNode> = {
            todo: <Clock className="h-3 w-3 mr-1" />,
            in_progress: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
            done: <Check className="h-3 w-3 mr-1" />,
            cancelled: <AlertCircle className="h-3 w-3 mr-1" />,
        };
        return (
            <Badge className={colors[status] || colors.todo}>
                {icons[status]}
                {status.replace('_', ' ')}
            </Badge>
        );
    };
    
    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
            urgent: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        };
        return <Badge className={colors[priority] || colors.medium}>{priority}</Badge>;
    };
    
    const getTicketStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        };
        return <Badge className={colors[status] || colors.open}>{status.replace('_', ' ')}</Badge>;
    };
    
    // Filtered data
    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const filteredDocuments = documents.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const filteredTickets = supportTickets.filter(t =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.message?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">{t('action.loading')}...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">{t('admin.title') || 'Administration'}</h1>
                        <p className="mt-1 text-muted-foreground">
                            {t('admin.subtitle') || 'Gérer les tâches, documents et tickets'}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Stats */}
            {dashboardStats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-none shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('admin.pendingTasks') || 'Tâches en attente'}</p>
                                    <p className="mt-1 text-3xl font-bold">{dashboardStats.pendingTasks}</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 text-white">
                                    <ListTodo className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('admin.openTickets') || 'Tickets ouverts'}</p>
                                    <p className="mt-1 text-3xl font-bold">{dashboardStats.openTickets}</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
                                    <HelpCircle className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('admin.totalDocuments') || 'Documents'}</p>
                                    <p className="mt-1 text-3xl font-bold">{dashboardStats.totalDocuments}</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 text-white">
                                    <FileText className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('admin.activeUsers') || 'Utilisateurs actifs'}</p>
                                    <p className="mt-1 text-3xl font-bold">{dashboardStats.activeUsers}</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 text-white">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {/* Search */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t('action.search') || 'Rechercher...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="flex flex-wrap gap-1 h-auto p-1">
                    <TabsTrigger value="tasks" className="gap-2">
                        <ListTodo className="h-4 w-4" />
                        {t('admin.tasks') || 'Tâches'} ({tasks.length})
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2">
                        <FileText className="h-4 w-4" />
                        {t('admin.documents') || 'Documents'} ({documents.length})
                    </TabsTrigger>
                    <TabsTrigger value="tickets" className="gap-2">
                        <HelpCircle className="h-4 w-4" />
                        {t('admin.tickets') || 'Tickets'} ({supportTickets.length})
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        {t('admin.notifications') || 'Notifications'} ({notifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="gap-2">
                        <History className="h-4 w-4" />
                        {t('admin.auditLog') || 'Journal d\'audit'}
                    </TabsTrigger>
                </TabsList>
                
                {/* Tasks Tab */}
                <TabsContent value="tasks">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('admin.taskManagement') || 'Gestion des tâches'}</CardTitle>
                            <Button onClick={() => setIsTaskDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('admin.newTask') || 'Nouvelle tâche'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                    {filteredTasks.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            {t('admin.noTasks') || 'Aucune tâche'}
                                        </p>
                                    ) : (
                                        filteredTasks.map((task) => (
                                            <motion.div
                                                key={task.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{task.title}</h4>
                                                        {getTaskStatusBadge(task.status)}
                                                        {task.priority && getPriorityBadge(task.priority)}
                                                    </div>
                                                    {task.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                    {task.due_date && (
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(task.due_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleUpdateTaskStatus(task.id, 'in_progress'); }}>
                                                            <Loader2 className="h-4 w-4 mr-2" />
                                                            {t('admin.markInProgress') || 'En cours'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleUpdateTaskStatus(task.id, 'done'); }}>
                                                            <Check className="h-4 w-4 mr-2" />
                                                            {t('admin.markCompleted') || 'Terminé'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-red-600"
                                                            onSelect={(e) => { e.preventDefault(); handleDeleteTask(task.id); }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            {t('action.delete')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Documents Tab */}
                <TabsContent value="documents">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('admin.documentManagement') || 'Gestion des documents'}</CardTitle>
                            <Button onClick={() => setIsDocumentDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('admin.newDocument') || 'Nouveau document'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                    {filteredDocuments.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            {t('admin.noDocuments') || 'Aucun document'}
                                        </p>
                                    ) : (
                                        filteredDocuments.map((doc) => (
                                            <motion.div
                                                key={doc.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-2">
                                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{doc.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {doc.type} {doc.created_at && `• ${new Date(doc.created_at).toLocaleDateString()}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Tickets Tab */}
                <TabsContent value="tickets">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('admin.ticketManagement') || 'Support tickets'}</CardTitle>
                            <Button onClick={() => setIsTicketDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('admin.newTicket') || 'Nouveau ticket'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                    {filteredTickets.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            {t('admin.noTickets') || 'Aucun ticket'}
                                        </p>
                                    ) : (
                                        filteredTickets.map((ticket) => (
                                            <motion.div
                                                key={ticket.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{ticket.subject}</h4>
                                                        {getTicketStatusBadge(ticket.status)}
                                                        {ticket.priority && getPriorityBadge(ticket.priority)}
                                                    </div>
                                                    {ticket.message && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {ticket.message}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {ticket.category} {ticket.created_at && `• ${new Date(ticket.created_at).toLocaleDateString()}`}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleUpdateTicketStatus(ticket.id, 'in_progress'); }}>
                                                            <Loader2 className="h-4 w-4 mr-2" />
                                                            {t('admin.markInProgress') || 'En cours'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleUpdateTicketStatus(ticket.id, 'resolved'); }}>
                                                            <Check className="h-4 w-4 mr-2" />
                                                            {t('admin.markResolved') || 'Résolu'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleUpdateTicketStatus(ticket.id, 'closed'); }}>
                                                            <AlertCircle className="h-4 w-4 mr-2" />
                                                            {t('admin.markClosed') || 'Fermé'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>{t('admin.notifications') || 'Notifications'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                    {notifications.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            {t('admin.noNotifications') || 'Aucune notification'}
                                        </p>
                                    ) : (
                                        notifications.map((notif) => (
                                            <motion.div
                                                key={notif.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-4 rounded-lg border ${notif.is_read ? 'bg-card' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200'}`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium">{notif.type}</h4>
                                                    <Badge variant="outline">{notif.type}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{notif.message}</p>
                                                {notif.created_at && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(notif.created_at).toLocaleString()}
                                                    </p>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Audit Log Tab */}
                <TabsContent value="audit">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>{t('admin.auditLog') || 'Journal d\'audit'}</CardTitle>
                            <CardDescription>{t('admin.auditLogDesc') || 'Historique des actions système'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-2">
                                    {auditLogs.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            {t('admin.noLogs') || 'Aucun log'}
                                        </p>
                                    ) : (
                                        auditLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex items-center gap-4 p-3 rounded-lg border bg-card text-sm"
                                            >
                                                <div className="flex-1">
                                                    <span className="font-medium">{log.action}</span>
                                                    {log.entity && (
                                                        <span className="text-muted-foreground ml-2">
                                                            sur {log.entity} ({log.entity_id?.slice(0, 8)}...)
                                                        </span>
                                                    )}
                                                </div>
                                                {log.created_at && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            {/* Task Dialog */}
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.createTask') || 'Créer une tâche'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('field.title') || 'Titre'}</Label>
                            <Input
                                value={taskForm.title}
                                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                placeholder={t('field.titlePlaceholder') || 'Titre de la tâche'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('field.description') || 'Description'}</Label>
                            <Textarea
                                value={taskForm.description}
                                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                placeholder={t('field.descriptionPlaceholder') || 'Description optionnelle'}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('field.priority') || 'Priorité'}</Label>
                                <Select
                                    value={taskForm.priority}
                                    onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">{t('priority.low') || 'Basse'}</SelectItem>
                                        <SelectItem value="medium">{t('priority.medium') || 'Moyenne'}</SelectItem>
                                        <SelectItem value="high">{t('priority.high') || 'Haute'}</SelectItem>
                                        <SelectItem value="urgent">{t('priority.urgent') || 'Urgente'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('field.dueDate') || 'Date limite'}</Label>
                                <Input
                                    type="date"
                                    value={taskForm.due_date}
                                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                            {t('action.cancel')}
                        </Button>
                        <Button onClick={handleCreateTask} disabled={isProcessing || !taskForm.title.trim()}>
                            {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {t('action.create') || 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Document Dialog */}
            <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.createDocument') || 'Ajouter un document'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('field.name') || 'Nom'}</Label>
                            <Input
                                value={documentForm.name}
                                onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
                                placeholder={t('field.namePlaceholder') || 'Nom du document'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('field.type') || 'Type'}</Label>
                            <Select
                                value={documentForm.type}
                                onValueChange={(v) => setDocumentForm({ ...documentForm, type: v as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="invoice">{t('document.invoice') || 'Facture'}</SelectItem>
                                    <SelectItem value="quote">{t('document.quote') || 'Devis'}</SelectItem>
                                    <SelectItem value="contract">{t('document.contract') || 'Contrat'}</SelectItem>
                                    <SelectItem value="report">{t('document.report') || 'Rapport'}</SelectItem>
                                    <SelectItem value="other">{t('document.other') || 'Autre'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('field.description') || 'Description'}</Label>
                            <Textarea
                                value={documentForm.description}
                                onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDocumentDialogOpen(false)}>
                            {t('action.cancel')}
                        </Button>
                        <Button onClick={handleCreateDocument} disabled={isProcessing || !documentForm.name.trim()}>
                            {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {t('action.add') || 'Ajouter'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Ticket Dialog */}
            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.createTicket') || 'Créer un ticket'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('field.subject') || 'Sujet'}</Label>
                            <Input
                                value={ticketForm.subject}
                                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                placeholder={t('field.subjectPlaceholder') || 'Sujet du ticket'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('field.description') || 'Description'}</Label>
                            <Textarea
                                value={ticketForm.description}
                                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                placeholder={t('field.descriptionPlaceholder') || 'Décrivez votre problème'}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('field.category') || 'Catégorie'}</Label>
                                <Select
                                    value={ticketForm.category}
                                    onValueChange={(v) => setTicketForm({ ...ticketForm, category: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bug">{t('category.bug') || 'Bug'}</SelectItem>
                                        <SelectItem value="feature">{t('category.feature') || 'Fonctionnalité'}</SelectItem>
                                        <SelectItem value="support">{t('category.support') || 'Support'}</SelectItem>
                                        <SelectItem value="billing">{t('category.billing') || 'Facturation'}</SelectItem>
                                        <SelectItem value="general">{t('category.general') || 'Général'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('field.priority') || 'Priorité'}</Label>
                                <Select
                                    value={ticketForm.priority}
                                    onValueChange={(v) => setTicketForm({ ...ticketForm, priority: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">{t('priority.low') || 'Basse'}</SelectItem>
                                        <SelectItem value="medium">{t('priority.medium') || 'Moyenne'}</SelectItem>
                                        <SelectItem value="high">{t('priority.high') || 'Haute'}</SelectItem>
                                        <SelectItem value="urgent">{t('priority.urgent') || 'Urgente'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
                            {t('action.cancel')}
                        </Button>
                        <Button onClick={handleCreateTicket} disabled={isProcessing || !ticketForm.subject.trim()}>
                            {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {t('action.create') || 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
