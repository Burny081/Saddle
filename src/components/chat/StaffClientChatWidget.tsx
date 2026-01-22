import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Send, MessageCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { generateId, getFromStorage, setToStorage } from '@/config/constants';

interface ClientMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
    timestamp: number;
    clientId: string;
}

interface ClientConversation {
    clientId: string;
    clientName: string;
    lastMessage: ClientMessage;
    unreadCount: number;
    messages: ClientMessage[];
}

const STORAGE_KEY = 'sps_client_messages';

export function StaffClientChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState<ClientConversation[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [totalUnread, setTotalUnread] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Accès pour répondre aux clients selon les rôles autorisés
    const authorizedRoles = ['superadmin', 'admin', 'manager', 'commercial', 'secretaire'];
    if (!user || user.role === 'client' || !authorizedRoles.includes(user.role)) {
        console.log('StaffClientChatWidget: Not showing for user:', user?.name, 'role:', user?.role, 'Authorized roles:', authorizedRoles);
        return null;
    }

    console.log('StaffClientChatWidget: Showing for authorized user:', user.name, 'role:', user.role);

    // Load and organize messages by client
    useEffect(() => {
        const loadConversations = () => {
            const allMessages = getFromStorage<ClientMessage[]>(STORAGE_KEY, []);
            const lastReadTimes = getFromStorage<Record<string, number>>(`${STORAGE_KEY}_staffRead_${user.id}`, {});

            // Group messages by clientId
            const grouped = allMessages.reduce((acc, msg) => {
                if (!acc[msg.clientId]) {
                    acc[msg.clientId] = [];
                }
                acc[msg.clientId].push(msg);
                return acc;
            }, {} as Record<string, ClientMessage[]>);

            // Convert to conversations array
            const convos: ClientConversation[] = Object.entries(grouped).map(([clientId, messages]) => {
                const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);
                const lastMessage = sortedMessages[sortedMessages.length - 1];
                const lastReadTime = lastReadTimes[clientId] || 0;

                // Count unread messages from clients (not from staff)
                const unreadCount = sortedMessages.filter(
                    m => m.senderRole === 'client' && m.timestamp > lastReadTime
                ).length;

                // Find client name from messages
                const clientMessage = sortedMessages.find(m => m.senderRole === 'client');
                const clientName = clientMessage?.senderName || `Client ${clientId.slice(0, 8)}`;

                return {
                    clientId,
                    clientName,
                    lastMessage,
                    unreadCount,
                    messages: sortedMessages,
                };
            });

            // Sort by last message time (most recent first)
            convos.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

            setConversations(convos);
            setTotalUnread(convos.reduce((sum, c) => sum + c.unreadCount, 0));
        };

        loadConversations();
        const interval = setInterval(loadConversations, 3000);
        return () => clearInterval(interval);
    }, [user.id]);

    // Auto-scroll when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedClientId, conversations]);

    const toggleChat = useCallback(() => {
        setIsOpen(prev => {
            if (prev) {
                setSelectedClientId(null); // Reset selection when closing
            }
            return !prev;
        });
    }, []);

    const selectClient = useCallback((clientId: string) => {
        setSelectedClientId(clientId);

        // Mark as read
        const lastReadTimes = getFromStorage<Record<string, number>>(`${STORAGE_KEY}_staffRead_${user.id}`, {});
        lastReadTimes[clientId] = Date.now();
        setToStorage(`${STORAGE_KEY}_staffRead_${user.id}`, lastReadTimes);
    }, [user.id]);

    const handleSend = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClientId || !inputRef.current || !inputRef.current.value.trim()) return;

        const newMessage: ClientMessage = {
            id: generateId(),
            senderId: user.id,
            senderName: user.name,
            senderRole: user.role,
            content: inputRef.current.value.trim(),
            timestamp: Date.now(),
            clientId: selectedClientId,
        };

        // Get all messages and add new one
        const allMessages = getFromStorage<ClientMessage[]>(STORAGE_KEY, []);
        const updated = [...allMessages, newMessage];
        setToStorage(STORAGE_KEY, updated);

        inputRef.current.value = '';
    }, [user, selectedClientId]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.clientId === selectedClientId);
    }, [conversations, selectedClientId]);

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4 pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="mb-4"
                            role="dialog"
                            aria-label="Messages clients"
                        >
                            <Card className="w-[350px] md:w-[400px] h-[500px] shadow-2xl border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shrink-0">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            {selectedClientId && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-white hover:bg-white/20 mr-1"
                                                    onClick={() => setSelectedClientId(null)}
                                                    aria-label="Retour à la liste"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Users className="h-4 w-4" aria-hidden="true" />
                                            {selectedClientId ? selectedConversation?.clientName : 'Messages Clients'}
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-white hover:bg-white/20"
                                            onClick={toggleChat}
                                            aria-label="Fermer"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-purple-100">
                                        {selectedClientId ? 'Conversation avec le client' : 'Répondez aux demandes des clients'}
                                    </p>
                                </CardHeader>

                                {!selectedClientId ? (
                                    // Conversations list
                                    <CardContent className="flex-1 overflow-y-auto p-0 bg-slate-50 dark:bg-slate-900">
                                        {conversations.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                                                <Users className="h-12 w-12 mb-4 opacity-50" />
                                                <p className="text-sm">Aucune conversation</p>
                                                <p className="text-xs mt-2">Les messages des clients apparaîtront ici.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {conversations.map((convo) => (
                                                    <button
                                                        type="button"
                                                        key={convo.clientId}
                                                        onClick={() => selectClient(convo.clientId)}
                                                        className="w-full p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-start gap-3"
                                                    >
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                                            {convo.clientName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium text-sm truncate">{convo.clientName}</span>
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                                {convo.lastMessage.senderRole === 'client' ? '' : 'Vous: '}
                                                                {convo.lastMessage.content}
                                                            </p>
                                                        </div>
                                                        {convo.unreadCount > 0 && (
                                                            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                                                                {convo.unreadCount}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                ) : (
                                    // Individual conversation
                                    <>
                                        <CardContent
                                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900"
                                            ref={scrollRef}
                                            role="log"
                                            aria-live="polite"
                                        >
                                            {selectedConversation?.messages.map((msg) => {
                                                const isMe = msg.senderId === user.id;
                                                const isClient = msg.senderRole === 'client';
                                                return (
                                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                            <div className={`flex items-center gap-1 text-xs mb-1 ${isMe ? 'text-purple-600' : 'text-slate-500'}`}>
                                                                {!isMe && <MessageCircle className="h-3 w-3" aria-hidden="true" />}
                                                                <span>{isMe ? 'Moi' : `${msg.senderName}${isClient ? '' : ' (Staff)'}`}</span>
                                                                <span className="text-[10px] text-slate-400">
                                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <div
                                                                className={`p-3 rounded-lg text-sm shadow-sm ${isMe
                                                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                                                                }`}
                                                            >
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                        <CardFooter className="p-3 bg-white dark:bg-slate-950 border-t shrink-0">
                                            <form onSubmit={handleSend} className="flex-1 flex gap-2">
                                                <Input
                                                    ref={inputRef}
                                                    placeholder="Répondre au client..."
                                                    className="flex-1"
                                                    autoFocus
                                                    aria-label="Message à envoyer"
                                                />
                                                <Button
                                                    type="submit"
                                                    size="icon"
                                                    className="bg-purple-600 text-white hover:bg-purple-700"
                                                    aria-label="Envoyer"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </CardFooter>
                                    </>
                                )}
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        type="button"
                        onClick={toggleChat}
                        className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/25 relative"
                        aria-label={isOpen ? 'Fermer' : `Messages clients${totalUnread > 0 ? ` (${totalUnread} non lus)` : ''}`}
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                        {totalUnread > 0 && !isOpen && (
                            <span
                                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold ring-2 ring-white"
                                aria-hidden="true"
                            >
                                {totalUnread}
                            </span>
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
