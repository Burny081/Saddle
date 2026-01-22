import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Trash2,
    ShoppingBag,
    Package,
    CreditCard,
    MessageSquare,
    AlertTriangle,
    Info,
    CheckCircle,
    XCircle,
    Settings,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useNotifications, type NotificationType } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';

const notificationIcons: Record<NotificationType, any> = {
    order: ShoppingBag,
    stock: Package,
    payment: CreditCard,
    message: MessageSquare,
    system: Settings,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    info: Info,
};

const notificationColors: Record<NotificationType, { bg: string; text: string; icon: string }> = {
    order: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-900 dark:text-blue-100', icon: 'text-blue-600' },
    stock: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-900 dark:text-purple-100', icon: 'text-purple-600' },
    payment: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-900 dark:text-green-100', icon: 'text-green-600' },
    message: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-900 dark:text-indigo-100', icon: 'text-indigo-600' },
    system: { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-900 dark:text-gray-100', icon: 'text-gray-600' },
    success: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-900 dark:text-green-100', icon: 'text-green-600' },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-900 dark:text-yellow-100', icon: 'text-yellow-600' },
    error: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-900 dark:text-red-100', icon: 'text-red-600' },
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-900 dark:text-blue-100', icon: 'text-blue-600' },
};

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
    const { t } = useLanguage();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return t('notifications.justNow');
        if (seconds < 3600) return t('notifications.minutesAgo', { count: Math.floor(seconds / 60).toString() });
        if (seconds < 86400) return t('notifications.hoursAgo', { count: Math.floor(seconds / 3600).toString() });
        if (seconds < 604800) return t('notifications.daysAgo', { count: Math.floor(seconds / 86400).toString() });
        return new Date(timestamp).toLocaleDateString();
    };

    const handleNotificationClick = (notificationId: string, actionUrl?: string) => {
        markAsRead(notificationId);
        if (actionUrl) {
            // Handle navigation if needed
            console.log('Navigate to:', actionUrl);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {t('notifications.title')}
                                </h3>
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {notifications.length > 0 && (
                                    <>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={markAllAsRead}
                                                className="text-xs"
                                                title={t('notifications.markAllRead')}
                                            >
                                                <CheckCheck className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearAll}
                                            className="text-xs text-red-600 hover:text-red-700"
                                            title={t('notifications.deleteAll')}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <Bell className="h-12 w-12 text-gray-400 mb-3" />
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {t('notifications.noNotifications')}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {notifications.map((notification) => {
                                        const Icon = notificationIcons[notification.type];
                                        const colors = notificationColors[notification.type];

                                        return (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                                                    !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                }`}
                                                onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
                                                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className={`text-sm font-semibold ${colors.text} ${!notification.read ? 'font-bold' : ''}`}>
                                                                {notification.title}
                                                            </h4>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-xs text-gray-500 dark:text-gray-500">
                                                                {formatTimeAgo(notification.timestamp)}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                {!notification.read && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            markAsRead(notification.id);
                                                                        }}
                                                                        title="Marquer comme lu"
                                                                    >
                                                                        <Check className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteNotification(notification.id);
                                                                    }}
                                                                    title="Supprimer"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
