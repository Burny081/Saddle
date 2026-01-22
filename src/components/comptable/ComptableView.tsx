import { useEffect, useState } from 'react';
import { getInvoices, getPayments, getCashJournal } from '@/utils/apiComptable';

type Invoice = {
  id: string;
  invoice_number: string;
  client_id: string;
  status: string;
  total: number;
  paid_amount: number;
  due_date: string;
  created_at: string;
};

type Payment = {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
};

type CashEntry = {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  journal_date: string;
};

export default function ComptableView() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cashJournal, setCashJournal] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [inv, pay, cash] = await Promise.all([
        getInvoices(),
        getPayments(),
        getCashJournal()
      ]);
      setInvoices(inv);
      setPayments(pay);
      setCashJournal(cash);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;

  // Calculs
  const totalCA = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const totalUnpaid = totalCA - totalPaid;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Espace Comptable</h1>

      {/* Dashboard financier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg">
          <div className="text-sm text-blue-600">Chiffre d'affaires</div>
          <div className="text-2xl font-bold">{totalCA.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <div className="text-sm text-green-600">Encaissé</div>
          <div className="text-2xl font-bold">{totalPaid.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <div className="text-sm text-orange-600">Créances</div>
          <div className="text-2xl font-bold">{totalUnpaid.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <div className="text-sm text-red-600">Factures en retard</div>
          <div className="text-2xl font-bold">{overdueInvoices}</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setActiveTab('invoices')} className={`pb-2 px-4 ${activeTab === 'invoices' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Factures</button>
        <button onClick={() => setActiveTab('payments')} className={`pb-2 px-4 ${activeTab === 'payments' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Paiements</button>
        <button onClick={() => setActiveTab('cash')} className={`pb-2 px-4 ${activeTab === 'cash' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Journal de caisse</button>
        <button onClick={() => setActiveTab('tva')} className={`pb-2 px-4 ${activeTab === 'tva' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>TVA</button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'invoices' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Suivi des factures</h2>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">N° Facture</th>
                <th className="p-2 text-left">Statut</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-right">Payé</th>
                <th className="p-2 text-left">Échéance</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t">
                  <td className="p-2">{inv.invoice_number}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      inv.status === 'paid' ? 'bg-green-200 text-green-800' :
                      inv.status === 'overdue' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>{inv.status}</span>
                  </td>
                  <td className="p-2 text-right">{inv.total?.toLocaleString()} FCFA</td>
                  <td className="p-2 text-right">{inv.paid_amount?.toLocaleString()} FCFA</td>
                  <td className="p-2">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Historique des paiements</h2>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Méthode</th>
                <th className="p-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(pay => (
                <tr key={pay.id} className="border-t">
                  <td className="p-2">{new Date(pay.payment_date).toLocaleDateString()}</td>
                  <td className="p-2">{pay.payment_method}</td>
                  <td className="p-2 text-right">{pay.amount?.toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'cash' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Journal de caisse</h2>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Catégorie</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {cashJournal.map(entry => (
                <tr key={entry.id} className="border-t">
                  <td className="p-2">{new Date(entry.journal_date).toLocaleDateString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${entry.type === 'income' ? 'bg-green-200' : 'bg-red-200'}`}>
                      {entry.type === 'income' ? 'Entrée' : 'Sortie'}
                    </span>
                  </td>
                  <td className="p-2">{entry.category}</td>
                  <td className="p-2">{entry.description}</td>
                  <td className="p-2 text-right">{entry.amount?.toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tva' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Déclarations TVA</h2>
          <p className="text-gray-500">Module en cours de développement...</p>
        </div>
      )}
    </div>
  );
}
