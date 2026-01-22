import { useEffect, useState } from 'react';
import { getDocuments } from '@/utils/api';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
};

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

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Documents</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type</th>
            <th>Téléchargement</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc.id}>
              <td>{doc.name}</td>
              <td>{doc.type}</td>
              <td><a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Télécharger</a></td>
              <td>{new Date(doc.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
