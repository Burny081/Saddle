import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
    STORAGE_KEYS,
    APP_SETTINGS,
    generateId,
    getFromStorage,
    setToStorage
} from '@/config/constants';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: number;
    channel: string; // 'general' or specific rooms
}

interface ChatContextType {
    isOpen: boolean;
    toggleChat: () => void;
    messages: Message[];
    sendMessage: (content: string) => void;
    unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const getWelcomeMessage = (): Message => ({
    id: 'welcome',
    senderId: 'system',
    senderName: 'System',
    content: 'Bienvenue dans le chat interne !',
    timestamp: Date.now(),
    channel: 'general'
});

export function ChatProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initial load
    useEffect(() => {
        const stored = getFromStorage<Message[] | null>(STORAGE_KEYS.chatMessages, null);
        if (stored && stored.length > 0) {
            setMessages(stored);
        } else {
            const welcomeMsg = getWelcomeMessage();
            setMessages([welcomeMsg]);
            setToStorage(STORAGE_KEYS.chatMessages, [welcomeMsg]);
        }
    }, []);

    // Poll for new messages (simulate real-time)
    useEffect(() => {
        const interval = setInterval(() => {
            const stored = getFromStorage<Message[]>(STORAGE_KEYS.chatMessages, []);
            if (stored.length > messages.length) {
                setMessages(stored);
                if (!isOpen) {
                    setUnreadCount(prev => prev + (stored.length - messages.length));
                }
            }
        }, APP_SETTINGS.chatPollingInterval);

        return () => clearInterval(interval);
    }, [messages.length, isOpen]);

    const toggleChat = useCallback(() => {
        setIsOpen(prev => {
            if (!prev) setUnreadCount(0); // Mark read on open
            return !prev;
        });
    }, []);

    const sendMessage = useCallback((content: string) => {
        if (!user || !content.trim()) return;

        const newMessage: Message = {
            id: generateId(),
            senderId: user.id,
            senderName: user.name,
            content: content.trim(),
            timestamp: Date.now(),
            channel: 'general'
        };

        setMessages(prev => {
            const updated = [...prev, newMessage];
            setToStorage(STORAGE_KEYS.chatMessages, updated);
            return updated;
        });
    }, [user]);

    return (
        <ChatContext.Provider value={{ isOpen, toggleChat, messages, sendMessage, unreadCount }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
