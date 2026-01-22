import {
    Menu,
    X,
    Sun,
    Moon,
    Globe,
    Search,
    User,
    Settings,
    LogOut
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
import { useTheme } from 'next-themes';
import { getRoleColor, navItems } from '@/data/navigation'; // Make sure this path is correct
import { StoreSelector, StoreSelectorMobile } from '@/components/layout/StoreSelector';
import { NotificationCenter } from '@/components/layout/NotificationCenter';

interface TopbarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    currentView: string;
}

export function Topbar({ sidebarOpen, setSidebarOpen, currentView }: TopbarProps) {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();

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

                {/* Notifications Center */}
                <NotificationCenter />

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
