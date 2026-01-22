import { useState } from 'react';
import { FileText, Monitor, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import SecuritySettings from './SecuritySettings';
import SessionManagement from './SessionManagement';
import AuditLogView from './AuditLogView';

export default function SecurityView() {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Journal d'Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManagement />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
