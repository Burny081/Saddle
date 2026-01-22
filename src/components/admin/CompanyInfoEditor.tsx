
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// Remplacer par vos vraies fonctions API
// import { getCompanySettings, updateCompanySettings, getStores, updateStore } from '@/utils/api';

// Types
type Company = {
  name: string;
  slogan?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
};
type Store = {
  id: string;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
};
type User = {
  role: string;
  sector?: string;
};

import { getCompanySettings, updateCompanySettings, getStores, updateStore } from '@/utils/api';

export default function CompanyInfoEditor() {
  const { user } = useAuth() as { user: User };
  const [company, setCompany] = useState<Company | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const companyData = await getCompanySettings();
      const storesData = await getStores();
      setCompany(companyData);
      setStores(storesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Permissions
  const canEditGlobal = user?.role === 'superadmin' || user?.role === 'admin';
  const canEditStore = (storeId: string) => {
    if (canEditGlobal) return true;
    if (user?.role === 'manager' || user?.role === 'commercial') {
      return user?.sector && user.sector === storeId;
    }
    return false;
  };

  // Handlers
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!company) return;
    setCompany({ ...company, [e.target.name]: e.target.value });
  };
  const handleCompanySave = async () => {
    if (company) {
      await updateCompanySettings(company);
      alert('Infos globales mises à jour !');
    }
  };
  const handleStoreChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setStores(stores.map(s => s.id === id ? { ...s, [e.target.name]: e.target.value } : s));
  };
  const handleStoreSave = async (id: string) => {
    const store = stores.find(s => s.id === id);
    if (store) {
      await updateStore(id, store);
      alert('Infos secteur mises à jour !');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Informations de la société</h2>
      {canEditGlobal ? (
        <div className="mb-8">
          <input name="name" value={company?.name || ''} onChange={handleCompanyChange} className="input" placeholder="Nom société" />
          <input name="slogan" value={company?.slogan || ''} onChange={handleCompanyChange} className="input" placeholder="Slogan" />
          <input name="address" value={company?.address || ''} onChange={handleCompanyChange} className="input" placeholder="Adresse" />
          <input name="phone" value={company?.phone || ''} onChange={handleCompanyChange} className="input" placeholder="Téléphone" />
          <input name="email" value={company?.email || ''} onChange={handleCompanyChange} className="input" placeholder="Email" />
          <input name="website" value={company?.website || ''} onChange={handleCompanyChange} className="input" placeholder="Site web" />
          <button onClick={handleCompanySave} className="btn-primary mt-2">Enregistrer</button>
        </div>
      ) : (
        <div className="mb-8">{company?.name} | {company?.slogan} | {company?.address}</div>
      )}
      <h2 className="text-xl font-bold mb-4">Informations par secteur</h2>
      {stores.map(store => (
        <div key={store.id} className="mb-6 border p-4 rounded">
          <h3 className="font-bold mb-2">{store.name} ({store.city})</h3>
          {canEditStore(store.id) ? (
            <>
              <input name="address" value={store.address || ''} onChange={e => handleStoreChange(store.id, e)} className="input" placeholder="Adresse" />
              <input name="phone" value={store.phone || ''} onChange={e => handleStoreChange(store.id, e)} className="input" placeholder="Téléphone" />
              <input name="email" value={store.email || ''} onChange={e => handleStoreChange(store.id, e)} className="input" placeholder="Email" />
              <button onClick={() => handleStoreSave(store.id)} className="btn-primary mt-2">Enregistrer</button>
            </>
          ) : (
            <div>{store.address} | {store.phone} | {store.email}</div>
          )}
        </div>
      ))}
    </div>
  );
}
