import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabaseClient';
import { 
  FileText, 
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface Quote {
  id: string;
  quote_number: string;
  created_at: string;
  valid_until: string;
  total_amount: number;
  status: string;
  items: any[];
  notes?: string;
}

const STATUS_CONFIG = {
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    icon: Clock
  },
  accepted: {
    label: 'Accepté',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle
  },
  rejected: {
    label: 'Refusé',
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    icon: XCircle
  },
  expired: {
    label: 'Expiré',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    icon: AlertCircle
  }
};

export default function ClientQuotesView() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, [user]);

  const fetchQuotes = async () => {
    if (!user) return;

    try {
      // Fetch from sales table where status is 'quote'
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          sale_number,
          created_at,
          total_amount,
          status,
          notes,
          sale_items (
            id,
            article_id,
            quantity,
            unit_price,
            articles (
              name,
              description
            )
          )
        `)
        .eq('client_id', user.id)
        .eq('status', 'quote')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuotes: Quote[] = (data || []).map((quote: any) => {
        // Calculate validity (30 days from creation)
        const validUntil = new Date(quote.created_at);
        validUntil.setDate(validUntil.getDate() + 30);

        // Check if expired
        const isExpired = new Date() > validUntil;
        const status = isExpired ? 'expired' : quote.status;

        return {
          id: quote.id,
          quote_number: quote.sale_number,
          created_at: quote.created_at,
          valid_until: validUntil.toISOString(),
          total_amount: quote.total_amount,
          status: status,
          items: quote.sale_items || [],
          notes: quote.notes
        };
      });

      setQuotes(formattedQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptQuote = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: 'accepted' })
        .eq('id', quoteId);

      if (error) throw error;

      // Refresh quotes
      fetchQuotes();
      setSelectedQuote(null);
      alert('Devis accepté avec succès !');
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Erreur lors de l\'acceptation du devis');
    }
  };

  const rejectQuote = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: 'rejected' })
        .eq('id', quoteId);

      if (error) throw error;

      // Refresh quotes
      fetchQuotes();
      setSelectedQuote(null);
      alert('Devis refusé');
    } catch (error) {
      console.error('Error rejecting quote:', error);
      alert('Erreur lors du refus du devis');
    }
  };

  const downloadQuote = (quote: Quote) => {
    // This would integrate with the PDF generation utility
    alert(`Téléchargement du devis ${quote.quote_number}...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Mes Devis</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {quotes.length} {quotes.length > 1 ? 'devis' : 'devis'}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {quotes.length === 0 && (
        <div className="text-center py-20">
          <FileText className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Aucun devis
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous n'avez pas encore de devis. Contactez-nous pour obtenir une estimation personnalisée !
          </p>
        </div>
      )}

      {/* Quotes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quotes.map((quote) => {
          const statusConfig = STATUS_CONFIG[quote.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
          const StatusIcon = statusConfig.icon;
          const isExpired = quote.status === 'expired';
          const isPending = quote.status === 'pending';

          return (
            <Card
              key={quote.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 dark:bg-slate-800"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h3 className="font-bold text-lg">{quote.quote_number}</h3>
                  </div>
                  <Badge className={`${statusConfig.color} border-0`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Valide jusqu'au {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Amount */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Montant Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {quote.total_amount.toLocaleString()} FCFA
                  </span>
                </div>

                {/* Items Preview */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Articles ({quote.items.length})
                  </p>
                  <div className="space-y-1">
                    {quote.items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.articles?.name || 'Article'} x{item.quantity}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {(item.unit_price * item.quantity).toLocaleString()} FCFA
                        </span>
                      </div>
                    ))}
                    {quote.items.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{quote.items.length - 3} autre(s) article(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {quote.notes && (
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">Note:</strong> {quote.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setSelectedQuote(quote)}
                    variant="outline"
                    className="flex-1 dark:border-slate-600 dark:text-gray-300"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </Button>
                  <Button
                    onClick={() => downloadQuote(quote)}
                    variant="outline"
                    className="dark:border-slate-600 dark:text-gray-300"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* Accept/Reject Actions */}
                {isPending && !isExpired && (
                  <div className="flex gap-2 pt-2 border-t dark:border-slate-700">
                    <Button
                      onClick={() => acceptQuote(quote.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepter
                    </Button>
                    <Button
                      onClick={() => rejectQuote(quote.id)}
                      variant="outline"
                      className="flex-1 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                  </div>
                )}

                {isExpired && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Ce devis a expiré. Contactez-nous pour le renouveler.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-slate-800">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white sticky top-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Détails du Devis</h2>
                <Button
                  onClick={() => setSelectedQuote(null)}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <XCircle className="h-6 w-6" />
                </Button>
              </div>
              <p className="text-blue-100">{selectedQuote.quote_number}</p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date de création</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedQuote.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Valide jusqu'au</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedQuote.valid_until).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Articles</h3>
                <div className="border dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Article</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Qté</th>
                        <th className="text-right p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Prix Unit.</th>
                        <th className="text-right p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-700">
                      {selectedQuote.items.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-3 text-gray-900 dark:text-white">{item.articles?.name || 'Article'}</td>
                          <td className="p-3 text-center text-gray-900 dark:text-white">{item.quantity}</td>
                          <td className="p-3 text-right text-gray-900 dark:text-white">
                            {item.unit_price.toLocaleString()} FCFA
                          </td>
                          <td className="p-3 text-right font-medium text-gray-900 dark:text-white">
                            {(item.unit_price * item.quantity).toLocaleString()} FCFA
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-bold text-gray-900 dark:text-white">
                          TOTAL
                        </td>
                        <td className="p-3 text-right font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {selectedQuote.total_amount.toLocaleString()} FCFA
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedQuote.notes && (
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Notes</h3>
                  <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    {selectedQuote.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => downloadQuote(selectedQuote)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
                {selectedQuote.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => acceptQuote(selectedQuote.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepter
                    </Button>
                    <Button
                      onClick={() => rejectQuote(selectedQuote.id)}
                      variant="outline"
                      className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
