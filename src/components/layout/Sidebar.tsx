import { useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { navItems } from '@/data/navigation';

interface SidebarProps {
    currentView: string;
    onViewChange: (view: string) => void;
    open: boolean;
}

export function Sidebar({ currentView, onViewChange, open }: SidebarProps) {
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    const filteredNavItems = useMemo(() =>
        navItems.filter((item) => user ? item.roles.includes(user.role) : false),
        [user]
    );

    const handleLogout = useCallback(() => {
        logout();
        window.location.reload();
    }, [logout]);

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: open ? 0 : -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`relative z-30 flex h-full w-[280px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl overflow-hidden ${open ? 'pointer-events-auto' : ''}`}
        >
            {/* Premium Gradient Background Effect (Optional subtle ambient glow) */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            {/* Logo Section */}
            <div className="flex h-20 items-center gap-3 px-6 pt-4">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg shadow-primary/20 p-1.5 overflow-hidden border border-border/50 flex-shrink-0">
                    <img src="/logo.png" alt="SPS" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                        Saddle Point Service
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Solutions Électriques</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
                {filteredNavItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`relative group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 overflow-hidden ${isActive
                                ? 'text-white shadow-lg shadow-primary/25'
                                : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                                }`}
                        >
                            {/* Active Background Gradient */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-gradient-to-r from-secondary to-primary"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <item.icon className={`relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}`} />
                            <span className="relative z-10">{t(item.label)}</span>

                            {/* Hover Glow Effect for non-active items */}
                            {!isActive && (
                                <div className="absolute inset-0 rounded-xl bg-primary/0 transition-colors duration-300 group-hover:bg-primary/5" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Sidebar Footer / Logout */}
            <div className="p-6 pb-8">
                <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-xl h-12 px-4"
                    onClick={handleLogout}
                    aria-label={t('nav.logout')}
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">{t('nav.logout')}</span>
                </Button>
            </div>
        </motion.aside>
    );
}
