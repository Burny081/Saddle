import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCompanySettings, type CompanySettings } from '@/utils/apiSettings';
import { COMPANY } from '@/config/constants';

interface CompanyContextType {
  companyInfo: CompanySettings | null;
  loading: boolean;
  refreshCompanyInfo: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyInfo, setCompanyInfo] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      
      // Try to load from database first
      console.log('Loading company data...');
      const dbCompany = await getCompanySettings();
      
      if (dbCompany) {
        console.log('Company data loaded from database:', dbCompany);
        setCompanyInfo(dbCompany);
      } else {
        console.log('No database data found, checking localStorage');
        // Fallback to localStorage
        const localCompany = localStorage.getItem('sps_company_settings');
        if (localCompany) {
          const parsed = JSON.parse(localCompany);
          console.log('Company data loaded from localStorage:', parsed);
          setCompanyInfo({
            id: 'default',
            name: parsed.name || COMPANY.name,
            short_name: parsed.shortName || parsed.short_name || COMPANY.shortName,
            slogan: parsed.slogan || COMPANY.slogan,
            address: parsed.address || COMPANY.address,
            city: 'Douala',
            country: 'Cameroun',
            phone: parsed.phone || COMPANY.phone,
            email: parsed.email || COMPANY.email,
            website: parsed.website || COMPANY.website,
            tax_rate: 19.25,
            currency: 'XAF',
            currency_symbol: 'FCFA',
            locale: 'fr-CM',
          });
        } else {
          console.log('No localStorage data found, using constants');
          // Final fallback to constants
          setCompanyInfo({
            id: 'default',
            name: COMPANY.name,
            short_name: COMPANY.shortName,
            slogan: COMPANY.slogan,
            address: COMPANY.address,
            city: 'Douala',
            country: 'Cameroun',
            phone: COMPANY.phone,
            email: COMPANY.email,
            website: COMPANY.website,
            tax_rate: 19.25,
            currency: 'XAF',
            currency_symbol: 'FCFA',
            locale: 'fr-CM',
          });
        }
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
      // Fallback to constants on error
      setCompanyInfo({
        id: 'default',
        name: COMPANY.name,
        short_name: COMPANY.shortName,
        slogan: COMPANY.slogan,
        address: COMPANY.address,
        city: 'Douala',
        country: 'Cameroun',
        phone: COMPANY.phone,
        email: COMPANY.email,
        website: COMPANY.website,
        tax_rate: 19.25,
        currency: 'XAF',
        currency_symbol: 'FCFA',
        locale: 'fr-CM',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const refreshCompanyInfo = async () => {
    console.log('Refreshing company info...');
    await loadCompanyInfo();
  };

  return (
    <CompanyContext.Provider value={{
      companyInfo,
      loading,
      refreshCompanyInfo,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

// Convenience hook to get company info with fallback
export function useCompanyInfo() {
  const { companyInfo } = useCompany();
  
  // Return a merged object with fallbacks
  return {
    name: companyInfo?.name || COMPANY.name,
    shortName: companyInfo?.short_name || COMPANY.shortName,
    slogan: companyInfo?.slogan || COMPANY.slogan,
    address: companyInfo?.address || COMPANY.address,
    city: companyInfo?.city || 'Douala',
    country: companyInfo?.country || 'Cameroun',
    phone: companyInfo?.phone || COMPANY.phone,
    email: companyInfo?.email || COMPANY.email,
    website: companyInfo?.website || COMPANY.website,
    taxRate: companyInfo?.tax_rate || 19.25,
    currency: companyInfo?.currency || 'XAF',
    currencySymbol: companyInfo?.currency_symbol || 'FCFA',
    locale: companyInfo?.locale || 'fr-CM',
    rccm: companyInfo?.rccm || COMPANY.rccm,
    niu: companyInfo?.niu || COMPANY.niu,
  };
}