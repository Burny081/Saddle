import React from 'react';
import { useVisitor } from '@/contexts/VisitorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Search, MapPin, Monitor, Smartphone, Globe } from 'lucide-react';

export function VisitorLogView() {
    const { visitors } = useVisitor();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredVisitors = visitors.filter(v =>
        v.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ip.includes(searchTerm) ||
        v.date.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Visitor Log</h2>
                    <p className="text-muted-foreground">Track all user access and traffic details.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search logs..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{visitors.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mobile Users</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {visitors.filter(v => v.device === 'Mobile').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Desktop Users</CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {visitors.filter(v => v.device === 'Desktop').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Access History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date et Heure</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location (Town)</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Device</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Page</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {filteredVisitors.map((visitor) => (
                                    <tr key={visitor.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{visitor.date}</span>
                                                <span className="text-xs text-muted-foreground">{visitor.time}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle font-mono text-xs">{visitor.ip}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3 text-blue-500" />
                                                {visitor.location}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                {visitor.device === 'Mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                                {visitor.device}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{visitor.page}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
