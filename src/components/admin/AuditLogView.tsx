import { useEffect, useState } from 'react';
import { getAuditLogs } from '@/utils/api';

type AuditLog = {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  details: Record<string, unknown>;
  created_at: string;
};

export default function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Historique des actions</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Action</th>
            <th>Entité</th>
            <th>Détails</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.user_id}</td>
              <td>{log.action}</td>
              <td>{log.entity}</td>
              <td>{JSON.stringify(log.details)}</td>
              <td>{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
