import { useEffect, useState } from 'react';
import { getQuotes, getProspects, getSalesTargets, getCommissions, getReminders } from '@/utils/apiCommercial';

type Quote = {
  id: string;
  quote_number: string;
  client_name: string;
  status: string;
  total: number;
  validity_date: string;
  created_at: string;
};

type Prospect = {
  id: string;
  company_name: string;
  contact_name: string;
  email?: string;
  phone?: string;
  status: string;
  source?: string;
};

type SalesTarget = {
  id: string;
  user_id: string;
  target_amount: number;
  achieved_amount: number;
  period_start: string;
  period_end: string;
};

type Commission = {
  id: string;
  user_id: string;
  sale_id: string;
  amount: number;
  status: string;
  created_at: string;
};

type Reminder = {
  id: string;
  title: string;
  description?: string;
  reminder_date: string;
  is_completed: boolean;
  priority?: string;
};

export default function CommercialView() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quotes');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [q, p, t, c, r] = await Promise.all([
        getQuotes(),
        getProspects(),
        getSalesTargets(),
        getCommissions(),
        getReminders()
      ]);
      setQuotes(q);
      setProspects(p);
      setTargets(t);
      setCommissions(c);
      setReminders(r);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;

  // Calculs
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
  const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
  const conversionRate = quotes.length > 0 ? ((acceptedQuotes / quotes.length) * 100).toFixed(1) : 0;

  const totalTargets = targets.reduce((sum, t) => sum + (t.target_amount || 0), 0);
  const totalAchieved = targets.reduce((sum, t) => sum + (t.achieved_amount || 0), 0);
  const achievementRate = totalTargets > 0 ? ((totalAchieved / totalTargets) * 100).toFixed(1) : 0;

  const totalCommissions = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0);

  const upcomingReminders = reminders.filter(r => !r.is_completed && new Date(r.reminder_date) >= new Date()).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Espace Commercial</h1>

      {/* Dashboard commercial */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg">
          <div className="text-sm text-blue-600">Devis en cours</div>
          <div className="text-2xl font-bold">{pendingQuotes}</div>
          <div className="text-xs text-gray-500">Taux de conversion: {conversionRate}%</div>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <div className="text-sm text-green-600">Objectifs atteints</div>
          <div className="text-2xl font-bold">{achievementRate}%</div>
          <div className="text-xs text-gray-500">{totalAchieved.toLocaleString()} / {totalTargets.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <div className="text-sm text-purple-600">Commissions</div>
          <div className="text-2xl font-bold">{totalCommissions.toLocaleString()} FCFA</div>
          <div className="text-xs text-gray-500">En attente: {pendingCommissions.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <div className="text-sm text-orange-600">Rappels à venir</div>
          <div className="text-2xl font-bold">{upcomingReminders}</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-4 mb-6 border-b flex-wrap">
        <button onClick={() => setActiveTab('quotes')} className={`pb-2 px-4 ${activeTab === 'quotes' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Devis</button>
        <button onClick={() => setActiveTab('prospects')} className={`pb-2 px-4 ${activeTab === 'prospects' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Prospects</button>
        <button onClick={() => setActiveTab('targets')} className={`pb-2 px-4 ${activeTab === 'targets' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Objectifs</button>
        <button onClick={() => setActiveTab('commissions')} className={`pb-2 px-4 ${activeTab === 'commissions' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Commissions</button>
        <button onClick={() => setActiveTab('reminders')} className={`pb-2 px-4 ${activeTab === 'reminders' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Rappels</button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'quotes' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Gestion des devis</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nouveau devis</button>
          </div>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">N° Devis</th>
                <th className="p-2 text-left">Client</th>
                <th className="p-2 text-left">Statut</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-left">Validité</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id} className="border-t">
                  <td className="p-2">{q.quote_number}</td>
                  <td className="p-2">{q.client_name}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      q.status === 'accepted' ? 'bg-green-200 text-green-800' :
                      q.status === 'rejected' ? 'bg-red-200 text-red-800' :
                      q.status === 'expired' ? 'bg-gray-200 text-gray-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>{q.status}</span>
                  </td>
                  <td className="p-2 text-right">{q.total?.toLocaleString()} FCFA</td>
                  <td className="p-2">{q.validity_date ? new Date(q.validity_date).toLocaleDateString() : '-'}</td>
                  <td className="p-2 text-center">
                    <button className="text-blue-600 hover:underline mr-2">Voir</button>
                    <button className="text-green-600 hover:underline">Convertir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'prospects' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pipeline des prospects</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nouveau prospect</button>
          </div>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Entreprise</th>
                <th className="p-2 text-left">Contact</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Téléphone</th>
                <th className="p-2 text-left">Source</th>
                <th className="p-2 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2 font-medium">{p.company_name}</td>
                  <td className="p-2">{p.contact_name}</td>
                  <td className="p-2">{p.email}</td>
                  <td className="p-2">{p.phone}</td>
                  <td className="p-2">{p.source}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === 'converted' ? 'bg-green-200 text-green-800' :
                      p.status === 'qualified' ? 'bg-blue-200 text-blue-800' :
                      p.status === 'contacted' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'targets' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Objectifs de vente</h2>
          <div className="space-y-4">
            {targets.map(t => {
              const progress = t.target_amount > 0 ? (t.achieved_amount / t.target_amount) * 100 : 0;
              return (
                <div key={t.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Période: {new Date(t.period_start).toLocaleDateString()} - {new Date(t.period_end).toLocaleDateString()}</span>
                    <span className="font-bold">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${progress >= 100 ? 'bg-green-600' : progress >= 75 ? 'bg-blue-600' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Réalisé: {t.achieved_amount?.toLocaleString()} FCFA</span>
                    <span>Objectif: {t.target_amount?.toLocaleString()} FCFA</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Mes commissions</h2>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-right">Montant</th>
                <th className="p-2 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-2 text-right">{c.amount?.toLocaleString()} FCFA</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${c.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      {c.status === 'paid' ? 'Payé' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Rappels & Relances</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nouveau rappel</button>
          </div>
          <div className="space-y-2">
            {reminders.map(r => (
              <div key={r.id} className={`border p-4 rounded-lg flex items-center justify-between ${r.is_completed ? 'bg-gray-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    checked={r.is_completed} 
                    className="w-5 h-5" 
                    readOnly 
                    aria-label={`Rappel ${r.is_completed ? 'complété' : 'en attente'}: ${r.title}`}
                  />
                  <div>
                    <div className={`font-medium ${r.is_completed ? 'line-through text-gray-500' : ''}`}>{r.title}</div>
                    <div className="text-sm text-gray-500">{r.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    r.priority === 'high' ? 'bg-red-200 text-red-800' :
                    r.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>{r.priority}</span>
                  <span className="text-sm text-gray-500">{new Date(r.reminder_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
