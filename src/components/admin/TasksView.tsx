import { useEffect, useState } from 'react';
import { getTasks } from '@/utils/api';

type Task = {
  id: string;
  title: string;
  assigned_to: string;
  status: string;
  due_date: string;
};

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setLoading(false);
    }
    fetchTasks();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestion des tâches</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Assigné à</th>
            <th>Statut</th>
            <th>Échéance</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.assigned_to}</td>
              <td>{task.status}</td>
              <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
