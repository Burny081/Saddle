import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from 'next-themes';
import { AlertTriangle } from 'lucide-react';
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
