import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from 'next-themes';
import { AlertTriangle, ArrowLeft, Globe, LogIn, Mail, MapPin, Phone } from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import { PublicHome } from '@/components/PublicHome';
import { LoginModal } from '@/components/LoginModal';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardView } from '@/components/dashboards/DashboardView';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { DataProvider } from '@/contexts/DataContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { VisitorProvider } from '@/contexts/VisitorContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { StoreAccessProvider } from '@/contexts/StoreAccessContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { Button } from '@/app/components/ui/button';
import { COMPANY } from '@/config/constants';
import {
  canAccessView,
  isProtectedView,
  pathForView,
  routeFromLocation,
  type ShopParams,
} from '@/app/routes';

const PointsOfSaleView = lazy(() => import('@/components/public/PointsOfSaleView').then((module) => ({ default: module.PointsOfSaleView })));
const AnalyticsDashboard = lazy(() => import('@/components/dashboards/AnalyticsDashboard').then((module) => ({ default: module.AnalyticsDashboard })));
const ClientDashboard = lazy(() => import('@/components/dashboards/ClientDashboard'));
const ClientProfile = lazy(() => import('@/components/client/ClientProfile'));
const ClientLoyaltyView = lazy(() => import('@/components/client/ClientLoyaltyView'));
const ClientQuotesView = lazy(() => import('@/components/client/ClientQuotesView'));
const ClientFavoritesView = lazy(() => import('@/components/client/ClientFavoritesView'));
const ArticlesView = lazy(() => import('@/components/catalog/ArticlesView').then((module) => ({ default: module.ArticlesView })));
const ServicesView = lazy(() => import('@/components/catalog/ServicesView').then((module) => ({ default: module.ServicesView })));
const EnhancedStockView = lazy(() => import('@/components/stock/EnhancedStockView').then((module) => ({ default: module.EnhancedStockView })));
const SalesView = lazy(() => import('@/components/sales/SalesView').then((module) => ({ default: module.SalesView })));
const ClientsView = lazy(() => import('@/components/catalog/ClientsView').then((module) => ({ default: module.ClientsView })));
const UsersView = lazy(() => import('@/components/admin/UsersView').then((module) => ({ default: module.UsersView })));
const ImageManagementView = lazy(() => import('@/components/admin/ImageManagementView'));
const PromotionsView = lazy(() => import('@/components/promotions/PromotionsView'));
const SecurityView = lazy(() => import('@/components/security/SecurityView'));
const ReportsView = lazy(() => import('@/components/reports/ReportsView').then((module) => ({ default: module.ReportsView })));
const SettingsView = lazy(() => import('@/components/settings/SettingsView').then((module) => ({ default: module.SettingsView })));
const ClientShopView = lazy(() => import('@/components/shop/ClientShopView').then((module) => ({ default: module.ClientShopView })));
const OrdersView = lazy(() => import('@/components/shop/OrdersView').then((module) => ({ default: module.OrdersView })));
const SuppliersView = lazy(() => import('@/components/suppliers/SuppliersView').then((module) => ({ default: module.SuppliersView })));
const StoresView = lazy(() => import('@/components/stores/StoresView').then((module) => ({ default: module.StoresView })));
const ComptableView = lazy(() => import('@/components/comptable/ComptableView'));
const CommercialView = lazy(() => import('@/components/commercial/CommercialView'));
const VisitorAnalyticsView = lazy(() => import('@/components/dashboards/components/VisitorAnalyticsView').then((module) => ({ default: module.VisitorAnalyticsView })));
const ChatWidget = lazy(() => import('@/components/chat/ChatWidget').then((module) => ({ default: module.ChatWidget })));
const ClientChatWidget = lazy(() => import('@/components/chat/ClientChatWidget').then((module) => ({ default: module.ClientChatWidget })));
const StaffClientChatWidget = lazy(() => import('@/components/chat/StaffClientChatWidget').then((module) => ({ default: module.StaffClientChatWidget })));

function PageLoadingFallback() {
  return <div className="flex min-h-64 items-center justify-center text-sm font-medium text-muted-foreground">Chargement de l’espace SaddlePoint…</div>;
}

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
  const { language, setLanguage } = useLanguage();

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
    return <Suspense fallback={<PageLoadingFallback />}><PointsOfSaleView onBack={() => navigateToView(isAuthenticated ? 'dashboard' : 'home')} /></Suspense>;
  }

  if (!isAuthenticated && currentView === 'shop') {
    return (
      <>
        <div className="min-h-screen bg-[#f7f8fa] text-foreground dark:bg-slate-950">
          <div className="border-b border-white/10 bg-slate-950 text-slate-200">
            <div className="mx-auto flex min-h-9 max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-1.5 text-[11px] font-medium tracking-wide sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <a href="tel:+237674932319" className="inline-flex items-center gap-1.5 transition-colors hover:text-white"><Phone className="h-3 w-3" /> {COMPANY.phone}</a>
                <a href={`mailto:${COMPANY.email}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-white"><Mail className="h-3 w-3" /> {COMPANY.email}</a>
                <span className="inline-flex items-center gap-1.5 text-slate-400"><MapPin className="h-3 w-3" /> {COMPANY.address}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')} aria-label="Changer de langue"><Globe className="mr-1 h-3 w-3" />{language === 'fr' ? 'FR' : 'EN'}</Button>
            </div>
          </div>
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
            <Suspense fallback={<PageLoadingFallback />}><ClientShopView
              initialCategory={shopParams.category}
              initialSubCategory={shopParams.subCategory}
              onBack={() => navigateToView('home')}
              showBackButton={false}
            /></Suspense>
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
      <Suspense fallback={<PageLoadingFallback />}>{renderView()}</Suspense>
      {/* Internal team chat (for staff) */}
      <Suspense fallback={null}><ChatWidget /></Suspense>
      {/* Client support chat (for clients to send messages) */}
      <Suspense fallback={null}><ClientChatWidget /></Suspense>
      {/* Staff view to respond to client messages (authorized staff only) */}
      <Suspense fallback={null}><StaffClientChatWidget /></Suspense>
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
