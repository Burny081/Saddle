import { useEffect, useState } from 'react';
import { getSupportTickets } from '@/utils/api';

type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export default function SupportTicketsView() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      const data = await getSupportTickets();
      setTickets(data);
      setLoading(false);
    }
    fetchTickets();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Tickets de support</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Sujet</th>
            <th>Message</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.user_id}</td>
              <td>{ticket.subject}</td>
              <td>{ticket.message}</td>
              <td>{ticket.status}</td>
              <td>{new Date(ticket.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
