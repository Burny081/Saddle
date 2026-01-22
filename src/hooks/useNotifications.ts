import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateId, getFromStorage, setToStorage } from '@/config/constants';

export type NotificationType = 'order' | 'stock' | 'payment' | 'message' | 'system' | 'success' | 'warning' | 'error' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    actionUrl?: string;
    metadata?: Record<string, any>;
}

const STORAGE_KEY = 'sps_notifications';
const MAX_NOTIFICATIONS = 100;

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load notifications on mount
    useEffect(() => {
        if (user) {
            const stored = getFromStorage<Record<string, Notification[]>>(STORAGE_KEY, {});
            const userNotifications = stored[user.id] || [];
            setNotifications(userNotifications.sort((a, b) => b.timestamp - a.timestamp));
        }
    }, [user]);

    // Save notifications to storage
    const saveNotifications = useCallback((notifs: Notification[]) => {
        if (user) {
            const stored = getFromStorage<Record<string, Notification[]>>(STORAGE_KEY, {});
            stored[user.id] = notifs.slice(0, MAX_NOTIFICATIONS); // Keep only latest 100
            setToStorage(STORAGE_KEY, stored);
            setNotifications(notifs);
        }
    }, [user]);

    // Add new notification
    const addNotification = useCallback((
        type: NotificationType,
        title: string,
        message: string,
        actionUrl?: string,
        metadata?: Record<string, any>
    ) => {
        if (!user) return;

        const newNotification: Notification = {
            id: generateId(),
            type,
            title,
            message,
            timestamp: Date.now(),
            read: false,
            actionUrl,
            metadata,
        };

        const updated = [newNotification, ...notifications];
        saveNotifications(updated);
    }, [user, notifications, saveNotifications]);

    // Mark notification as read
    const markAsRead = useCallback((notificationId: string) => {
        const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        saveNotifications(updated);
    }, [notifications, saveNotifications]);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        saveNotifications(updated);
    }, [notifications, saveNotifications]);

    // Delete notification
    const deleteNotification = useCallback((notificationId: string) => {
        const updated = notifications.filter(n => n.id !== notificationId);
        saveNotifications(updated);
    }, [notifications, saveNotifications]);

    // Clear all notifications
    const clearAll = useCallback(() => {
        saveNotifications([]);
    }, [saveNotifications]);

    // Get unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    };
}
