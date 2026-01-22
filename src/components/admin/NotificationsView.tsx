import { useEffect, useState } from 'react';
import { getNotifications } from '@/utils/api';

type Notification = {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setLoading(false);
    }
    fetchNotifications();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      <ul className="list-disc pl-6">
        {notifications.map(n => (
          <li key={n.id} className={n.is_read ? 'text-gray-400' : 'font-bold'}>
            {n.message} <span className="text-xs">({new Date(n.created_at).toLocaleString()})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
