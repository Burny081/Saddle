import {
    Menu,
    X,
    Sun,
    Moon,
    Globe,
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    Package,
    CreditCard,
    Check
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAlerts } from '@/contexts/AlertContext';
import { useTheme } from 'next-themes';
import { getRoleColor, navItems } from '@/data/navigation'; // Make sure this path is correct
import { StoreSelector, StoreSelectorMobile } from '@/components/layout/StoreSelector';

interface TopbarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    currentView: string;
}

export function Topbar({ sidebarOpen, setSidebarOpen, currentView }: TopbarProps) {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const { alerts, unreadCount, markAsRead, markAllAsRead } = useAlerts();

    const unreadAlerts = unreadCount;
    const currentLabel = navItems.find((item) => item.id === currentView)?.label || 'nav.dashboard';

    return (
        <header className="sticky top-0 z-20 flex h-14 sm:h-16 lg:h-20 items-center justify-between px-3 sm:px-4 lg:px-8 backdrop-blur-xl bg-background/80 border-b border-border/40 transition-all duration-300">
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
                >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                <div className="hidden sm:block">
                    <h2 className="text-base sm:text-lg lg:text-2xl font-bold tracking-tight text-foreground line-clamp-1">{t(currentLabel)}</h2>
                    <p className="text-xs lg:text-sm text-muted-foreground hidden md:block">
                        {t('welcome')}, {user ? user.name.split(' ')[0] : t('auth.guest')}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                {/* Search Bar - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/5 border border-border/50 focus-within:border-primary/50 focus-within:bg-secondary/10 transition-all w-48 xl:w-64 group">
                    <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder={t('placeholder.search')}
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/70"
                    />
                </div>

                {/* Mobile Search Button */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-lg h-8 w-8 sm:h-9 sm:w-9 hover:bg-secondary/10"
                >
                    <Search className="h-4 w-4 text-muted-foreground" />
                </Button>

                {/* Store Selector - Desktop */}
                <StoreSelector />
                {/* Store Selector - Mobile */}
                <StoreSelectorMobile />

                {/* Language Switcher */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex rounded-lg h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 hover:bg-secondary/10"
                    onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                >
                    <Globe className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                    <span className="sr-only">Toggle Language</span>
                </Button>

                {/* Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative rounded-lg h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 hover:bg-secondary/10"
                        >
                            <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                            {unreadAlerts > 0 && (
                                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]" align="end" forceMount>
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>{t('notifications.title')}</span>
                            {unreadAlerts > 0 && (
                                <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                                    {unreadAlerts} {t('notifications.unread')}
                                </span>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            {alerts.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    {t('empty.noNotifications')}
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <DropdownMenuItem
                                        key={alert.id}
                                        className={`flex items-start gap-3 p-3 cursor-pointer ${!alert.read ? 'bg-primary/5' : ''}`}
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            markAsRead(alert.id);
                                        }}
                                    >
                                        <div className={`flex-shrink-0 p-2 rounded-full ${
                                            alert.type === 'warning'
                                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                                                : alert.type === 'success'
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                : alert.type === 'error'
                                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {alert.type === 'warning' && <Package className="h-4 w-4" />}
                                            {alert.type === 'success' && <CreditCard className="h-4 w-4" />}
                                            {alert.type === 'error' && <Bell className="h-4 w-4" />}
                                            {alert.type === 'info' && <Bell className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!alert.read ? 'font-medium' : ''}`}>
                                                {alert.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(alert.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {!alert.read && (
                                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-2" />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                        {alerts.length > 0 && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="justify-center text-primary cursor-pointer"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        markAllAsRead();
                                    }}
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    <span>{t('action.markAllRead')}</span>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="hidden sm:flex rounded-lg h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 hover:bg-secondary/10"
                >
                    {theme === 'dark' ? <Sun className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500" /> : <Moon className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-500" />}
                </Button>

                {/* User Profile Dropdown */}
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full ring-2 ring-border hover:ring-primary transition-all p-0 overflow-hidden"
                            >
                                <Avatar className={`h-full w-full bg-gradient-to-br ${getRoleColor(user.role)}`}>
                                    <AvatarFallback className="text-white font-bold text-xs sm:text-sm">
                                        {user.name.split(' ').map((n) => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)]" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>{t('nav.profile')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>{t('nav.settings')}</span>
                            </DropdownMenuItem>

                            {/* Mobile-only options */}
                            <div className="sm:hidden">
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setLanguage(language === 'fr' ? 'en' : 'fr'); }}>
                                    <Globe className="mr-2 h-4 w-4" />
                                    <span>{language === 'fr' ? 'English' : 'Français'}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTheme(theme === 'dark' ? 'light' : 'dark'); }}>
                                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                                    <span>{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
                                </DropdownMenuItem>
                            </div>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); logout(); }} className="text-destructive focus:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{t('nav.logout')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
