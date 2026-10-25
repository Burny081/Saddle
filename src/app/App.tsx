import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from 'next-themes';
import { AlertTriangle, ArrowLeft, LogIn } from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import { PublicHome } from '@/components/PublicHome';
import { LoginModal } from '@/components/LoginModal';
import { PointsOfSaleView } from '@/components/public/PointsOfSaleView';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardView } from '@/components/dashboards/DashboardView';
import { AnalyticsDashboard } from '@/components/dashboards/AnalyticsDashboard';
import ClientDashboard from '@/components/dashboards/ClientDashboard';
import ClientProfile from '@/components/client/ClientProfile';
import ClientLoyaltyView from '@/components/client/ClientLoyaltyView';
import ClientQuotesView from '@/components/client/ClientQuotesView';
import ClientFavoritesView from '@/components/client/ClientFavoritesView';
import { ArticlesView } from '@/components/catalog/ArticlesView';
import { ServicesView } from '@/components/catalog/ServicesView';
import { EnhancedStockView } from '@/components/stock/EnhancedStockView';
import { SalesView } from '@/components/sales/SalesView';
import { ClientsView } from '@/components/catalog/ClientsView';
import { UsersView } from '@/components/admin/UsersView';
import ImageManagementView from '@/components/admin/ImageManagementView';
import PromotionsView from '@/components/promotions/PromotionsView';
import SecurityView from '@/components/security/SecurityView';
import { ReportsView } from '@/components/reports/ReportsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { ClientShopView } from '@/components/shop/ClientShopView';
import { OrdersView } from '@/components/shop/OrdersView';
import { SuppliersView } from '@/components/suppliers/SuppliersView';
import { StoresView } from '@/components/stores/StoresView';
import ComptableView from '@/components/comptable/ComptableView';
import CommercialView from '@/components/commercial/CommercialView';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DataProvider } from '@/contexts/DataContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { VisitorProvider } from '@/contexts/VisitorContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { StoreAccessProvider } from '@/contexts/StoreAccessContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { Button } from '@/app/components/ui/button';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ClientChatWidget } from '@/components/chat/ClientChatWidget';
import { StaffClientChatWidget } from '@/components/chat/StaffClientChatWidget';
import { VisitorAnalyticsView } from '@/components/dashboards/components/VisitorAnalyticsView';
import {
  canAccessView,
  isProtectedView,
  pathForView,
  routeFromLocation,
  type ShopParams,
} from '@/app/routes';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentView, setCurrentView] = useState(() =>
    routeFromLocation(window.location.pathname, window.location.search).view,
  );
  const [shopParams, setShopParams] = useState<ShopParams>(() =>
    routeFromLocation(window.location.pathname, window.location.search).shopParams,
  );
  const { isAuthenticated, user } = useAuth();

  // Show splash screen for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const navigateToView = useCallback((view: string, nextShopParams: ShopParams = {}, replace = false) => {
    const resolvedShopParams = view === 'shop' ? nextShopParams : {};
    const targetPath = pathForView(view, resolvedShopParams);
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (currentPath !== targetPath) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', targetPath);
    }

    setCurrentView(view);
    setShopParams(resolvedShopParams);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const route = routeFromLocation(window.location.pathname, window.location.search);
      setCurrentView(route.view);
      setShopParams(route.shopParams);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentView === 'home') {
      navigateToView('dashboard', {}, true);
    }
  }, [currentView, isAuthenticated, navigateToView]);

  // Navigate back to dashboard
  const navigateToDashboard = useCallback(() => {
    navigateToView('dashboard');
  }, [navigateToView]);

  if (showSplash) {
    return <SplashScreen />;
  }

  const handleBrowseShop = (category?: string, subCategory?: string) => {
    navigateToView('shop', { category, subCategory });
  };

  if (!isAuthenticated && currentView !== 'shop' && currentView !== 'points-of-sale') {
    return (
      <>
        <PublicHome
          onLoginClick={() => setShowLoginModal(true)}
          onBrowseShop={handleBrowseShop}
          onViewPointsOfSale={() => navigateToView('points-of-sale')}
        />
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  // Handle Public Views (Guest or Authenticated)
  if (currentView === 'points-of-sale') {
    return <PointsOfSaleView onBack={() => navigateToView(isAuthenticated ? 'dashboard' : 'home')} />;
  }

  if (!isAuthenticated && currentView === 'shop') {
    return (
      <>
        <div className="min-h-screen bg-[#f7f8fa] text-foreground dark:bg-slate-950">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => navigateToView('home')}
                className="flex min-w-0 items-center gap-3 text-left"
                aria-label="Retour à l'accueil SaddlePoint"
              >
                <img src="/logo.png" alt="" className="h-9 w-9 shrink-0 object-contain" />
                <span className="min-w-0">
                  <strong className="company-name block truncate text-xs text-slate-950 dark:text-white">Saddle Point Service</strong>
                  <span className="block truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Catalogue professionnel</span>
                </span>
              </button>
              <nav aria-label="Navigation de la boutique" className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigateToView('home')} className="h-10 border-slate-300 bg-white px-3 font-bold text-slate-900 hover:border-[#124a93] hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Accueil
                </Button>
                <Button onClick={() => setShowLoginModal(true)} className="h-10 bg-[#b7212d] px-3 font-bold text-white hover:bg-[#941b25] sm:px-4">
                  <LogIn className="mr-2 h-4 w-4" /> Connexion
                </Button>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
            <ClientShopView
              initialCategory={shopParams.category}
              initialSubCategory={shopParams.subCategory}
              onBack={() => navigateToView('home')}
              showBackButton={false}
              onLoginRequired={() => setShowLoginModal(true)}
            />
          </main>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  const renderView = () => {
    // Strict RBAC Check
    if (user && isProtectedView(currentView) && !canAccessView(currentView, user.role)) {
      return (
        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Accès Refusé</h2>
          <p className="text-muted-foreground">Vous n'avez pas la permission d'accéder à cette page ({currentView}).</p>
          <Button onClick={navigateToDashboard} className="mt-4">
            Retour au Tableau de Bord
          </Button>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        // Dashboard différent selon le rôle
        if (user?.role === 'client') {
          return <ClientDashboard onNavigate={navigateToView} />;
        }
        return <DashboardView onNavigate={navigateToView} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'articles':
      case 'articles-new':
        return <ArticlesView initialCreate={currentView === 'articles-new'} onBack={navigateToDashboard} />;
      case 'services':
        return <ServicesView onBack={navigateToDashboard} />;
      case 'stock':
        return <EnhancedStockView onBack={navigateToDashboard} />;
      case 'shop':
        return <ClientShopView initialCategory={shopParams.category} initialSubCategory={shopParams.subCategory} onBack={navigateToDashboard} />;
      case 'orders':
        return <OrdersView onBack={navigateToDashboard} />;
      case 'favorites':
        return <ClientFavoritesView />;
      case 'quotes':
        return <ClientQuotesView />;
      case 'loyalty':
        return <ClientLoyaltyView />;
      case 'profile':
        return <ClientProfile />;
      case 'visitors':
        return <VisitorAnalyticsView onBack={navigateToDashboard} />;
      case 'sales':
      case 'sales-new':
        return <SalesView initialCreate={currentView === 'sales-new'} onBack={navigateToDashboard} />;
      case 'clients':
      case 'clients-new':
        return <ClientsView initialCreate={currentView === 'clients-new'} onBack={navigateToDashboard} />;
      case 'users':
        return <UsersView onBack={navigateToDashboard} />;
      case 'images':
        return <ImageManagementView />;
      case 'promotions':
        return <PromotionsView />;
      case 'security':
        return <SecurityView />;
      case 'suppliers':
        return <SuppliersView onBack={navigateToDashboard} />;
      case 'stores':
        return <StoresView onBack={navigateToDashboard} />;
      case 'accounting':
        return <ComptableView />;
      case 'commercial':
        return <CommercialView />;
      case 'reports':
        return <ReportsView onBack={navigateToDashboard} />;
      case 'settings':
        return <SettingsView onBack={navigateToDashboard} />;
      default:
        return <DashboardView onNavigate={navigateToView} />;
    }
  };

  return (
    <DashboardLayout currentView={currentView} onViewChange={navigateToView}>
      {renderView()}
      {/* Internal team chat (for staff) */}
      <ChatWidget />
      {/* Client support chat (for clients to send messages) */}
      <ClientChatWidget />
      {/* Staff view to respond to client messages (authorized staff only) */}
      <StaffClientChatWidget />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <LanguageProvider>
          <CompanyProvider>
            <DataProvider>
              <StoreAccessProvider>
                <ChatProvider>
                  <VisitorProvider>
                    <AlertProvider>
                      <AppContent />
                    </AlertProvider>
                  </VisitorProvider>
                </ChatProvider>
              </StoreAccessProvider>
            </DataProvider>
          </CompanyProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
