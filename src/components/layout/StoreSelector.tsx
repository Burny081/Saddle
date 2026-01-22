import { Store, ChevronDown, Globe, Building2, Check } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Badge } from '@/app/components/ui/badge';
import { useStoreAccess } from '@/contexts/StoreAccessContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function StoreSelector() {
    const { t } = useLanguage();
    const {
        stores,
        activeStoreId,
        accessibleStores,
        accessType,
        isGlobalAccess,
        setActiveStore,
    } = useStoreAccess();

    // Don't show selector for clients or if no stores
    if (accessibleStores.length === 0) return null;

    // Get current store info
    const currentStore = stores.find(s => s.id === activeStoreId);

    // Single store users don't need a selector - just show the store name
    if (accessType === 'single' && !isGlobalAccess) {
        return (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 border border-border/50">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate max-w-[120px] lg:max-w-[180px]">
                    {currentStore?.shortName || currentStore?.name || t('store.noStore')}
                </span>
            </div>
        );
    }

    // Multiple stores or global access - show dropdown
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="hidden md:flex items-center gap-2 h-9 px-3 border-border/50 hover:bg-secondary/10"
                >
                    {isGlobalAccess ? (
                        <Globe className="h-4 w-4 text-blue-500" />
                    ) : (
                        <Store className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium truncate max-w-[100px] lg:max-w-[150px]">
                        {currentStore?.shortName || currentStore?.name || t('store.selectStore')}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 z-[100]" align="start" sideOffset={8}>
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>{t('store.selectStore')}</span>
                    {isGlobalAccess && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                            <Globe className="h-3 w-3 mr-1" />
                            {t('store.globalAccess')}
                        </Badge>
                    )}
                    {accessType === 'multiple' && !isGlobalAccess && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                            {accessibleStores.length} {t('store.stores')}
                        </Badge>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Show "All Stores" option for global access users */}
                {isGlobalAccess && (
                    <>
                        <DropdownMenuItem
                            className="flex items-center gap-3 cursor-pointer"
                            onSelect={(e) => {
                                e.preventDefault();
                                setActiveStore('');
                            }}
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                <Globe className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{t('store.allStores')}</p>
                                <p className="text-xs text-muted-foreground">{t('store.viewAllData')}</p>
                            </div>
                            {!activeStoreId && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                
                {/* Store list */}
                <div className="max-h-[300px] overflow-y-auto">
                    {accessibleStores.map((store) => (
                        <DropdownMenuItem
                            key={store.id}
                            className="flex items-center gap-3 cursor-pointer"
                            onSelect={(e) => {
                                e.preventDefault();
                                setActiveStore(store.id);
                            }}
                        >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                store.isHeadquarters 
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                                    : 'bg-gradient-to-br from-slate-500 to-slate-600'
                            }`}>
                                <Building2 className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">
                                        {store.shortName || store.name}
                                    </p>
                                    {store.isHeadquarters && (
                                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                                            HQ
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {store.city}, {store.country}
                                </p>
                            </div>
                            {activeStoreId === store.id && (
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Mobile version - compact
export function StoreSelectorMobile() {
    const { t } = useLanguage();
    const {
        stores,
        activeStoreId,
        accessibleStores,
        accessType,
        isGlobalAccess,
        setActiveStore,
    } = useStoreAccess();

    if (accessibleStores.length === 0) return null;

    const currentStore = stores.find(s => s.id === activeStoreId);

    // Single store - just show badge
    if (accessType === 'single' && !isGlobalAccess) {
        return (
            <Badge variant="secondary" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {currentStore?.shortName || currentStore?.city || t('store.noStore')}
            </Badge>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                    {isGlobalAccess ? (
                        <Globe className="h-3.5 w-3.5 text-blue-500" />
                    ) : (
                        <Store className="h-3.5 w-3.5" />
                    )}
                    <span className="text-xs max-w-[60px] truncate">
                        {currentStore?.city || t('store.all')}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[100]" align="end" sideOffset={8}>
                <DropdownMenuLabel>{t('store.selectStore')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {isGlobalAccess && (
                    <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        setActiveStore('');
                    }}>
                        <Globe className="h-4 w-4 mr-2 text-blue-500" />
                        {t('store.allStores')}
                        {!activeStoreId && <Check className="h-4 w-4 ml-auto" />}
                    </DropdownMenuItem>
                )}
                
                {accessibleStores.map((store) => (
                    <DropdownMenuItem
                        key={store.id}
                        onSelect={(e) => {
                            e.preventDefault();
                            setActiveStore(store.id);
                        }}
                    >
                        <Building2 className="h-4 w-4 mr-2" />
                        <span className="truncate">{store.shortName || store.name}</span>
                        {activeStoreId === store.id && <Check className="h-4 w-4 ml-auto" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
