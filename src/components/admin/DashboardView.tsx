import AuditLogView from './AuditLogView';
import NotificationsView from './NotificationsView';
import TasksView from './TasksView';
import DocumentsView from './DocumentsView';
import SupportTicketsView from './SupportTicketsView';

export default function DashboardView() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord administrateur</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <NotificationsView />
          <TasksView />
        </div>
        <div>
          <DocumentsView />
          <SupportTicketsView />
        </div>
      </div>
      <div className="mt-12">
        <AuditLogView />
      </div>
    </div>
  );
}
