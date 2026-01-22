import { useEffect, useState } from 'react';
import { getDocuments } from '@/utils/api';
import { FileText, Download, Shield, Calendar } from 'lucide-react';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
};

const staticDocuments = [
  {
    id: 'politique-sante-securite',
    name: 'Politique - Santé - Sécurité',
    type: 'Politique d\'entreprise',
    description: 'Document officiel sur la politique de santé et sécurité au travail',
    url: '/guidelines/POLITIQUE-SANTE-SECURITE.md',
    icon: Shield,
    category: 'Politique',
    created_at: '2026-01-22',
  },
];

export default function DocumentsView() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data);
      setLoading(false);
    }
    fetchDocuments();
  }, []);

  const handleViewDocument = async (url: string, name: string) => {
    if (url.endsWith('.md')) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${name}</title>
                <meta charset="utf-8">
                <style>
                  body { 
                    font-family: system-ui, -apple-system, sans-serif; 
                    max-width: 800px; 
                    margin: 40px auto; 
                    padding: 20px;
                    line-height: 1.6;
                  }
                  h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
                  h2 { color: #3b82f6; margin-top: 30px; }
                  h3 { color: #60a5fa; }
                  ul { padding-left: 25px; }
                  li { margin: 10px 0; }
                  hr { border: none; border-top: 2px solid #e5e7eb; margin: 30px 0; }
                </style>
              </head>
              <body>
                <pre style="white-space: pre-wrap; font-family: inherit;">${text}</pre>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } catch (error) {
        console.error('Erreur lors de la lecture du document:', error);
      }
    } else {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Documents de l'Entreprise
        </h2>
        <p className="text-gray-600 mt-2">Politiques, procédures et documents officiels</p>
      </div>

      {/* Documents Statiques (Politiques) */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Politiques d'Entreprise
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staticDocuments.map((doc) => {
            const IconComponent = doc.icon;
            return (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDocument(doc.url, doc.name)}
              >
                <div className="flex items-start justify-between mb-3">
                  <IconComponent className="w-10 h-10 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {doc.category}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{doc.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
                    <Download className="w-3 h-3" />
                    Voir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents Dynamiques */}
      {documents.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Autres Documents
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Nom</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{doc.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doc.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
