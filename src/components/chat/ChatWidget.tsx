import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

export function ChatWidget() {
    const { user } = useAuth();
    const { isOpen, toggleChat, messages, sendMessage, unreadCount } = useChat();
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Only show for non-client roles
    if (!user || user.role === 'client') {
        console.log('ChatWidget: Not showing for user:', user?.name, 'role:', user?.role);
        return null;
    }

    console.log('ChatWidget: Showing for staff user:', user.name, 'role:', user.role);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (inputRef.current && inputRef.current.value.trim()) {
            sendMessage(inputRef.current.value);
            inputRef.current.value = '';
        }
    }, [sendMessage]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="mb-4"
                            role="dialog"
                            aria-label="Chat interne"
                        >
                            <Card className="w-[350px] md:w-[400px] h-[500px] shadow-2xl border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shrink-0">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                            Chat Interne
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-white hover:bg-white/20"
                                            onClick={toggleChat}
                                            aria-label="Fermer le chat"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-blue-100">Communication équipe (Superadmin, Admin, Staff)</p>
                                </CardHeader>
                                <CardContent
                                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900"
                                    ref={scrollRef}
                                    role="log"
                                    aria-live="polite"
                                    aria-label="Messages du chat"
                                >
                                    {messages.map((msg) => {
                                        const isMe = msg.senderId === user.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`flex items-center gap-1 text-xs mb-1 ${isMe ? 'text-blue-600' : 'text-slate-500'}`}>
                                                        {!isMe && <User className="h-3 w-3" aria-hidden="true" />}
                                                        <span>{isMe ? 'Moi' : msg.senderName}</span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`p-3 rounded-lg text-sm shadow-sm ${isMe
                                                                ? 'bg-blue-600 text-white rounded-tr-none'
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
                                            placeholder="Écrivez un message..."
                                            className="flex-1"
                                            autoFocus
                                            aria-label="Message à envoyer"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className="bg-blue-600 text-white hover:bg-blue-700"
                                            aria-label="Envoyer le message"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        type="button"
                        onClick={toggleChat}
                        className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25 relative"
                        aria-label={isOpen ? 'Fermer le chat' : `Ouvrir le chat${unreadCount > 0 ? ` (${unreadCount} messages non lus)` : ''}`}
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                        {unreadCount > 0 && !isOpen && (
                            <span
                                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold ring-2 ring-white"
                                aria-hidden="true"
                            >
                                {unreadCount}
                            </span>
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
