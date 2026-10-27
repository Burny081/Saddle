import { useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { navItems } from '@/data/navigation';
import { getNavigationGroups } from './navigationGroups';

interface SidebarProps {
    currentView: string;
    onViewChange: (view: string) => void;
    open: boolean;
}

export function Sidebar({ currentView, onViewChange, open }: SidebarProps) {
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    const navigationGroups = useMemo(() => user && user.role !== 'client'
        ? getNavigationGroups(navItems, user.role)
        : [], [user]);

    const clientNavItems = useMemo(() =>
        user?.role === 'client' ? navItems.filter((item) => item.roles.includes(user.role)) : [],
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
            className={`relative z-30 flex h-full w-[280px] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[10px_0_32px_-26px_rgba(15,23,42,.36)] ${open ? 'pointer-events-auto' : ''}`}
        >
            {/* Logo Section */}
            <div className="flex h-20 items-center gap-3 px-6 pt-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white p-1.5 shadow-sm">
                    <img src="/logo.png" alt="SPS" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                    <h1 className="company-name whitespace-nowrap text-xs text-foreground">
                        Saddle Point Service
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Solutions Électriques</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-8" aria-label="Navigation principale">
                {(user?.role === 'client' ? [{ id: 'client', label: '', items: clientNavItems }] : navigationGroups).map((group) => (
                    <div key={group.id} className="space-y-1">
                    {group.label && <p className="px-4 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{group.label}</p>}
                    {group.items.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`relative group flex w-full items-center gap-3 overflow-hidden border-l-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 ease-out cursor-pointer ${isActive
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground'
                                }`}
                        >
                            <item.icon className={`relative z-10 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                            <span className="relative z-10">{t(item.label)}</span>
                        </button>
                    );
                    })}
                    </div>
                ))}
            </nav>

            {/* Sidebar Footer / Logout */}
            {user && (
                <div className="p-6 pb-8">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-12 w-full justify-start gap-3 rounded-md px-4 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleLogout}
                        aria-label={t('nav.logout')}
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">{t('nav.logout')}</span>
                    </Button>
                </div>
            )}
        </motion.aside>
    );
}
