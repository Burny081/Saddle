import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type {
    Article,
    Service,
    Client,
    Sale,
} from '@/types/compatibility';
import {
    generateId,
} from '@/config/constants';
import * as CatalogAPI from '@/utils/apiCatalog';
import * as SalesAPI from '@/utils/apiSales';
import { useNotifications } from '@/hooks/useNotifications';
import { sendOrderConfirmation, sendInvoice, sendWelcomeEmail, sendStockAlert } from '@/utils/emailService';

// Fallback empty data (no more mock data dependency)
const fallbackArticles: Article[] = [];
const fallbackServices: Service[] = [];
const fallbackClients: Client[] = [];
const fallbackSales: Sale[] = [];

interface DataContextType {
    articles: Article[];
    services: Service[];
    clients: Client[];
    sales: Sale[];
    isLoading: boolean;
    error: string | null;

    // Article Actions
    addArticle: (article: Omit<Article, 'id'>) => Promise<void>;
    updateArticle: (id: string, updates: Partial<Article>) => Promise<void>;
    deleteArticle: (id: string) => Promise<void>;

    // Service Actions
    addService: (service: Omit<Service, 'id'>) => Promise<void>;
    updateService: (id: string, updates: Partial<Service>) => Promise<void>;
    deleteService: (id: string) => Promise<void>;

    // Client Actions
    addClient: (client: Omit<Client, 'id' | 'totalSpent'>) => Promise<void>;
    updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;

    // Sale Actions
    addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<void>;
    updateSale: (id: string, updates: Partial<Sale>) => Promise<void>;

    // Refresh data
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper: Convert API types to Legacy types (for component compatibility)
function mapApiArticleToLocal(apiArticle: CatalogAPI.Article): Article {
    return {
        id: apiArticle.id,
        name: apiArticle.name,
        category: apiArticle.category || '',
        description: apiArticle.description || '',
        price: apiArticle.price,
        purchasePrice: apiArticle.purchase_price,
        stock: apiArticle.stock,
        minStock: apiArticle.min_stock,
        image: apiArticle.image || '',
        status: apiArticle.status,
        unit: apiArticle.unit,
    };
}

function mapApiServiceToLocal(apiService: CatalogAPI.Service): Service {
    return {
        id: apiService.id,
        name: apiService.name,
        category: apiService.category || '',
        description: apiService.description || '',
        price: apiService.price,
        duration: apiService.duration || '',
        image: apiService.image || '',
        status: apiService.status,
    };
}

function mapApiClientToLocal(apiClient: CatalogAPI.Client): Client {
    return {
        id: apiClient.id,
        name: apiClient.name,
        email: apiClient.email || '',
        phone: apiClient.phone || '',
        address: apiClient.address || '',
        totalSpent: apiClient.total_spent || 0,
    };
}

function mapApiSaleToLocal(apiSale: SalesAPI.Sale): Sale {
    // Map API status to component status
    const statusMap: Record<string, 'pending' | 'completed' | 'delivered' | 'partial'> = {
        'pending': 'pending',
        'partial': 'partial',
        'completed': 'completed',
        'cancelled': 'pending',
        'refunded': 'pending',
    };
    
    return {
        id: apiSale.id,
        clientName: apiSale.client_name || '',
        items: (apiSale.items || []).map(item => ({
            type: item.item_type as 'article' | 'service',
            id: item.item_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: apiSale.total,
        paid: apiSale.paid >= apiSale.total, // Convert amount to boolean (fully paid)
        status: statusMap[apiSale.status] || 'pending',
        date: apiSale.date,
        invoiceNumber: apiSale.invoice_number,
        createdBy: apiSale.created_by,
        createdByName: apiSale.created_by_name,
        storeId: apiSale.store_id
    };
}

export function DataProvider({ children }: { children: ReactNode }) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useNotifications();

    // Load data from Supabase (with empty array fallback)
    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [apiArticles, apiServices, apiClients, apiSales] = await Promise.all([
                CatalogAPI.getArticles(),
                CatalogAPI.getServices(),
                CatalogAPI.getClients(),
                SalesAPI.getSales()
            ]);

            setArticles(apiArticles.map(mapApiArticleToLocal));
            setServices(apiServices.map(mapApiServiceToLocal));
            setClients(apiClients.map(mapApiClientToLocal));
            setSales(apiSales.map(mapApiSaleToLocal));
        } catch (err) {
            console.warn('Failed to load from Supabase:', err);
            setError('Connexion base de données échouée. Veuillez réessayer.');
            // Use empty fallback
            setArticles(fallbackArticles);
            setServices(fallbackServices);
            setClients(fallbackClients);
            setSales(fallbackSales);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Article Actions
    const addArticle = useCallback(async (article: Omit<Article, 'id'>) => {
        const newId = generateId();
        try {
            const apiArticle = await CatalogAPI.createArticle({
                id: newId,
                name: article.name,
                category: article.category || '',
                description: article.description || '',
                price: article.price,
                purchase_price: article.purchasePrice,
                stock: article.stock,
                min_stock: article.minStock,
                image: article.image || '',
                status: article.status,
                unit: article.unit || 'unit'
            });
            setArticles(prev => [...prev, mapApiArticleToLocal(apiArticle)]);
        } catch (err) {
            console.error('Failed to create article:', err);
            // Optimistic local update
            setArticles(prev => [...prev, { ...article, id: newId }]);
        }
    }, []);

    const updateArticle = useCallback(async (id: string, updates: Partial<Article>) => {
        try {
            // Map local field names to API field names
            const apiUpdates: Partial<CatalogAPI.Article> = {};
            if (updates.name !== undefined) apiUpdates.name = updates.name;
            if (updates.category !== undefined) apiUpdates.category = updates.category;
            if (updates.description !== undefined) apiUpdates.description = updates.description;
            if (updates.price !== undefined) apiUpdates.price = updates.price;
            if (updates.purchasePrice !== undefined) apiUpdates.purchase_price = updates.purchasePrice;
            if (updates.stock !== undefined) apiUpdates.stock = updates.stock;
            if (updates.minStock !== undefined) apiUpdates.min_stock = updates.minStock;
            if (updates.image !== undefined) apiUpdates.image = updates.image;
            if (updates.status !== undefined) apiUpdates.status = updates.status;
            if (updates.unit !== undefined) apiUpdates.unit = updates.unit;

            await CatalogAPI.updateArticle(id, apiUpdates);

            // Check for low stock notification
            if (updates.stock !== undefined) {
                const article = articles.find(a => a.id === id);
                if (article && updates.stock <= article.minStock) {
                    addNotification(
                        'warning',
                        'Stock bas',
                        `${article.name}: ${updates.stock} unités restantes`,
                        '/stock'
                    );
                }
            }
        } catch (err) {
            console.error('Failed to update article:', err);
        }
        setArticles(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }, [articles, addNotification]);

    const deleteArticle = useCallback(async (id: string) => {
        try {
            await CatalogAPI.deleteArticle(id);
        } catch (err) {
            console.error('Failed to delete article:', err);
        }
        setArticles(prev => prev.filter(item => item.id !== id));
    }, []);

    // Service Actions
    const addService = useCallback(async (service: Omit<Service, 'id'>) => {
        const newId = generateId();
        try {
            const apiService = await CatalogAPI.createService({
                id: newId,
                name: service.name,
                category: service.category,
                description: service.description,
                price: service.price,
                duration: service.duration,
                image: service.image,
                status: service.status
            });
            setServices(prev => [...prev, mapApiServiceToLocal(apiService)]);
        } catch (err) {
            console.error('Failed to create service:', err);
            setServices(prev => [...prev, { ...service, id: newId }]);
        }
    }, []);

    const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
        try {
            await CatalogAPI.updateService(id, updates as Partial<CatalogAPI.Service>);
        } catch (err) {
            console.error('Failed to update service:', err);
        }
        setServices(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }, []);

    const deleteService = useCallback(async (id: string) => {
        try {
            await CatalogAPI.deleteService(id);
        } catch (err) {
            console.error('Failed to delete service:', err);
        }
        setServices(prev => prev.filter(item => item.id !== id));
    }, []);

    // Client Actions
    const addClient = useCallback(async (client: Omit<Client, 'id' | 'totalSpent'>) => {
        const newId = generateId();
        try {
            const apiClient = await CatalogAPI.createClient({
                id: newId,
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
                client_type: 'individual',
                is_active: true
            });
            setClients(prev => [...prev, mapApiClientToLocal(apiClient)]);
            
            // Add notification for new client
            addNotification(
                'info',
                'Nouveau client',
                `${client.name} a été ajouté avec succès`,
                '/clients'
            );

            // Send welcome email if enabled
            const emailConfig = JSON.parse(localStorage.getItem('emailConfig') || '{}');
            if (emailConfig.enableWelcomeEmail && client.email) {
                await sendWelcomeEmail({
                    email: client.email,
                    name: client.name,
                    shopUrl: window.location.origin
                });
            }
        } catch (err) {
            console.error('Failed to create client:', err);
            setClients(prev => [...prev, { ...client, id: newId, totalSpent: 0 }]);
        }
    }, [addNotification]);

    const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
        try {
            const apiUpdates: Partial<CatalogAPI.Client> = {};
            if (updates.name !== undefined) apiUpdates.name = updates.name;
            if (updates.email !== undefined) apiUpdates.email = updates.email;
            if (updates.phone !== undefined) apiUpdates.phone = updates.phone;
            if (updates.address !== undefined) apiUpdates.address = updates.address;
            if (updates.totalSpent !== undefined) apiUpdates.total_spent = updates.totalSpent;
            
            await CatalogAPI.updateClient(id, apiUpdates);
        } catch (err) {
            console.error('Failed to update client:', err);
        }
        setClients(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }, []);

    const deleteClient = useCallback(async (id: string) => {
        try {
            await CatalogAPI.deleteClient(id);
        } catch (err) {
            console.error('Failed to delete client:', err);
        }
        setClients(prev => prev.filter(item => item.id !== id));
    }, []);

    // Sale Actions
    const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date'>) => {
        const newId = generateId();
        const storeId = saleData.storeId || localStorage.getItem('sps_current_store') || 'store-1';
        
        try {
            const invoiceNumber = await SalesAPI.generateInvoiceNumber(storeId);
            const subtotal = saleData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const taxAmount = subtotal * 0.1925; // TVA Cameroun

            // Map component status to API status
            const apiStatus = saleData.status === 'delivered' ? 'completed' : saleData.status;

            const apiSale = await SalesAPI.createSale({
                invoice_number: invoiceNumber,
                store_id: storeId,
                client_name: saleData.clientName,
                items: saleData.items.map(item => ({
                    item_type: item.type,
                    item_id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total_price: item.price * item.quantity
                })),
                subtotal,
                tax_amount: taxAmount,
                total: saleData.total,
                paid: saleData.paid ? saleData.total : 0, // Convert boolean to amount
                status: apiStatus as SalesAPI.Sale['status'],
                created_by: saleData.createdBy,
                created_by_name: saleData.createdByName
            });

            setSales(prev => [mapApiSaleToLocal(apiSale), ...prev]);

            // Add success notification
            addNotification(
                'success',
                'Nouvelle vente',
                `Facture ${invoiceNumber} créée avec succès`,
                '/sales'
            );

            // Send order confirmation email if enabled
            const emailConfig = JSON.parse(localStorage.getItem('emailConfig') || '{}');
            const client = clients.find(c => c.name === saleData.clientName);
            
            if (emailConfig.enableOrderConfirmation && client?.email) {
                await sendOrderConfirmation({
                    orderNumber: invoiceNumber,
                    clientName: saleData.clientName,
                    clientEmail: client.email,
                    date: new Date().toLocaleDateString('fr-FR'),
                    status: 'En traitement',
                    items: saleData.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        total: item.price * item.quantity
                    })),
                    total: saleData.total,
                    trackingUrl: window.location.origin + '/sales'
                });
            }

            // Send invoice email if enabled and marked as paid
            if (emailConfig.enableInvoiceEmail && saleData.paid && client?.email) {
                await sendInvoice({
                    invoiceNumber,
                    clientName: saleData.clientName,
                    clientEmail: client.email,
                    clientPhone: client.phone,
                    date: new Date().toLocaleDateString('fr-FR'),
                    items: saleData.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity
                    })),
                    subtotal,
                    tax: taxAmount,
                    total: saleData.total,
                    downloadUrl: window.location.origin + '/sales'
                });
            }

            // Update local stock and check for low stock
            setArticles(prevArticles => {
                return prevArticles.map(article => {
                    const saleItem = saleData.items.find(item => item.id === article.id && item.type === 'article');
                    if (saleItem) {
                        const newStock = article.stock - saleItem.quantity;
                        
                        // Check for low stock
                        if (newStock <= article.minStock) {
                            addNotification(
                                'warning',
                                'Stock bas',
                                `${article.name}: ${newStock} unités restantes`,
                                '/stock'
                            );

                            // Send stock alert email if enabled
                            if (emailConfig.enableStockAlerts && emailConfig.stockAlertRecipients) {
                                const recipients = emailConfig.stockAlertRecipients.split(',').map((r: string) => r.trim());
                                sendStockAlert({
                                    articleName: article.name,
                                    currentStock: newStock,
                                    minStock: article.minStock,
                                    suggestedOrder: Math.max(article.minStock * 3 - newStock, 0),
                                    unit: article.unit || 'unités',
                                    orderUrl: window.location.origin + '/stock'
                                }, recipients);
                            }
                        }
                        
                        return { ...article, stock: newStock };
                    }
                    return article;
                });
            });
        } catch (err) {
            console.error('Failed to create sale:', err);
            // Optimistic local update
            const newSale: Sale = {
                ...saleData,
                id: newId,
                date: new Date().toISOString(),
                invoiceNumber: `FAC-${newId.slice(0, 8)}`
            };
            setSales(prev => [newSale, ...prev]);
            setArticles(prevArticles => {
                return prevArticles.map(article => {
                    const saleItem = saleData.items.find(item => item.id === article.id && item.type === 'article');
                    if (saleItem) {
                        return { ...article, stock: article.stock - saleItem.quantity };
                    }
                    return article;
                });
            });
        }
    }, [addNotification]);

    const updateSale = useCallback(async (id: string, updates: Partial<Sale>) => {
        try {
            const apiUpdates: Partial<SalesAPI.Sale> = {};
            if (updates.clientName !== undefined) apiUpdates.client_name = updates.clientName;
            if (updates.total !== undefined) apiUpdates.total = updates.total;
            if (updates.paid !== undefined) apiUpdates.paid = updates.paid ? updates.total || 0 : 0; // Convert boolean to amount
            if (updates.status !== undefined) {
                apiUpdates.status = updates.status === 'delivered' ? 'completed' : updates.status as SalesAPI.Sale['status'];
            }
            
            await SalesAPI.updateSale(id, apiUpdates);
        } catch (err) {
            console.error('Failed to update sale:', err);
        }
        setSales(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }, []);

    return (
        <DataContext.Provider value={{
            articles, services, clients, sales, isLoading, error,
            addArticle, updateArticle, deleteArticle,
            addService, updateService, deleteService,
            addClient, updateClient, deleteClient,
            addSale, updateSale, refreshData: loadData
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
