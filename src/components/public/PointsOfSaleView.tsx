import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Navigation, CheckCircle2, ArrowLeft, Globe, User, Building2, Calendar, Star, Filter } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StoreInfo } from '@/components/stores/StoresView';
import * as StoresAPI from '@/utils/apiStores';

interface PointsOfSaleViewProps {
    onBack: () => void;
}

const STORAGE_KEY_STORES = 'sps_stores';

// Default stores if none in localStorage
const defaultStores: StoreInfo[] = [
    {
        id: 'store-yde',
        name: 'Saddle Point Service - Yaoundé',
        shortName: 'SPS Yaoundé',
        country: 'Cameroun',
        city: 'Yaoundé',
        address: 'Bastos, Avenue des Ambassades, Face ambassade du Nigeria',
        postalCode: 'BP 1234',
        phone: '+237 699 00 11 22',
        alternatePhone: '+237 222 20 11 22',
        email: 'yaounde@saddlepoint.cm',
        website: 'https://saddlepoint.cm',
        manager: 'M. Jean-Pierre Manga',
        managerEmail: 'jp.manga@saddlepoint.cm',
        managerPhone: '+237 699 00 11 23',
        workingDays: 'Lundi - Samedi',
        openTime: '08:00',
        closeTime: '18:00',
        yearsOfExpertise: 15,
        foundedYear: 2011,
        services: ['Vente', 'Installation', 'Maintenance', 'Conseil'],
        features: ['Showroom', 'Service Technique', 'Vente Directe', 'Support Pro', 'Parking'],
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
        isHeadquarters: true,
        isActive: true,
        taxId: 'M012400000000A',
        registrationNumber: 'RC/YDE/2011/B/0001',
        coordinates: { lat: 3.8480, lng: 11.5021 },
        createdAt: '2011-03-15T00:00:00',
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'store-dla',
        name: 'Saddle Point Service - Douala',
        shortName: 'SPS Douala',
        country: 'Cameroun',
        city: 'Douala',
        address: 'Akwa, Boulevard de la Liberté, Ancien immeuble Air France',
        postalCode: 'BP 5678',
        phone: '+237 677 33 44 55',
        alternatePhone: '+237 233 42 33 44',
        email: 'douala@saddlepoint.cm',
        website: 'https://saddlepoint.cm/douala',
        manager: 'Mme. Sarah Eboa',
        managerEmail: 's.eboa@saddlepoint.cm',
        managerPhone: '+237 677 33 44 56',
        workingDays: 'Lundi - Samedi',
        openTime: '08:30',
        closeTime: '18:30',
        yearsOfExpertise: 12,
        foundedYear: 2014,
        services: ['Vente', 'Installation', 'Logistique', 'Formation'],
        features: ['Showroom', 'Vente en Gros', 'Logistique', 'Formation', 'Entrepôt'],
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200',
        isHeadquarters: false,
        isActive: true,
        taxId: 'M012400000001B',
        registrationNumber: 'RC/DLA/2014/B/0123',
        coordinates: { lat: 4.0511, lng: 9.7679 },
        createdAt: '2014-06-20T00:00:00',
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'store-de',
        name: 'Saddle Point Service - Deutschland',
        shortName: 'SPS Germany',
        country: 'Allemagne',
        city: 'Frankfurt',
        address: 'Kaiserstraße 45, 60329 Frankfurt am Main',
        postalCode: '60329',
        phone: '+49 69 123 456 78',
        alternatePhone: '+49 69 123 456 79',
        email: 'germany@saddlepoint.de',
        website: 'https://saddlepoint.de',
        manager: 'Herr Klaus Weber',
        managerEmail: 'k.weber@saddlepoint.de',
        managerPhone: '+49 151 123 456 78',
        workingDays: 'Montag - Freitag',
        openTime: '09:00',
        closeTime: '18:00',
        yearsOfExpertise: 3,
        foundedYear: 2023,
        services: ['Sales', 'Installation', 'Consulting', 'Support'],
        features: ['Showroom', 'Technical Support', 'Training Center', 'Warehouse'],
        image: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?auto=format&fit=crop&q=80&w=1200',
        isHeadquarters: false,
        isActive: true,
        taxId: 'DE123456789',
        registrationNumber: 'HRB 123456',
        coordinates: { lat: 50.1109, lng: 8.6821 },
        createdAt: '2023-01-15T00:00:00',
        updatedAt: new Date().toISOString(),
    }
];

export function PointsOfSaleView({ onBack }: PointsOfSaleViewProps) {
    const { t } = useLanguage();
    const [stores, setStores] = useState<StoreInfo[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('all');

    // Load stores from Supabase API
    useEffect(() => {
        const loadStores = async () => {
            try {
                const apiStores = await StoresAPI.getStores(true); // Active stores only
                if (apiStores.length > 0) {
                    const mappedStores: StoreInfo[] = apiStores.map(s => ({
                        id: s.id,
                        name: s.name,
                        shortName: s.short_name || '',
                        country: s.country,
                        city: s.city,
                        address: s.address || '',
                        postalCode: s.postal_code || '',
                        phone: s.phone || '',
                        alternatePhone: s.alternate_phone,
                        email: s.email || '',
                        website: s.website,
                        manager: s.manager || '',
                        workingDays: s.working_days || 'Lundi - Samedi',
                        openTime: s.open_time || '08:00',
                        closeTime: s.close_time || '18:00',
                        yearsOfExpertise: s.years_of_expertise || 0,
                        foundedYear: s.founded_year || new Date().getFullYear(),
                        services: [],
                        features: [],
                        image: s.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
                        isHeadquarters: s.is_headquarters,
                        isActive: s.is_active,
                        coordinates: s.latitude && s.longitude ? { lat: s.latitude, lng: s.longitude } : undefined,
                        createdAt: s.created_at || new Date().toISOString(),
                        updatedAt: s.updated_at || new Date().toISOString(),
                    }));
                    setStores(mappedStores);
                } else {
                    // No stores from API - empty array instead of mock data
                    setStores([]);
                }
            } catch (error) {
                console.error('Error loading stores from Supabase:', error);
                setStores([]);
            }
        };
        
        loadStores();
    }, []);

    // Get unique countries
    const countries = useMemo(() => {
        const uniqueCountries = [...new Set(stores.map(s => s.country))];
        return uniqueCountries.sort();
    }, [stores]);

    // Filtered stores
    const filteredStores = useMemo(() => {
        if (selectedCountry === 'all') return stores;
        return stores.filter(store => store.country === selectedCountry);
    }, [stores, selectedCountry]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-slate-900/80 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=2000"
                    alt="Map Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-center">
                    <Button
                        onClick={onBack}
                        variant="ghost"
                        className="w-fit text-white mb-6 hover:bg-white/10 hover:text-white"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Retour à l'accueil
                    </Button>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold text-white mb-4"
                    >
                        Nos Points de Vente
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-blue-100 max-w-2xl"
                    >
                        {stores.length} points de vente dans {countries.length} pays. Nos équipes d'experts sont prêtes à vous accueillir et vous conseiller.
                    </motion.p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="container mx-auto px-6 -mt-10 relative z-30 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Filter className="h-5 w-5" />
                        <span className="font-medium">Filtrer par pays:</span>
                    </div>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger className="w-full sm:w-64">
                            <SelectValue placeholder="Tous les pays" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Tous les pays ({stores.length})
                                </div>
                            </SelectItem>
                            {countries.map(country => (
                                <SelectItem key={country} value={country}>
                                    {country} ({stores.filter(s => s.country === country).length})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </motion.div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-8">
                    {filteredStores.map((store, index) => (
                        <motion.div
                            key={store.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 group"
                        >
                            {/* Image Header */}
                            <div className="h-64 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                <img
                                    src={store.image}
                                    alt={store.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                                    <Badge className="bg-blue-600 hover:bg-blue-700">{store.city}</Badge>
                                    {store.isHeadquarters && (
                                        <Badge className="bg-amber-500 hover:bg-amber-600">
                                            <Star className="mr-1 h-3 w-3" />
                                            Siège
                                        </Badge>
                                    )}
                                </div>
                                <div className="absolute bottom-6 left-6 right-6 z-20">
                                    <h2 className="text-2xl font-bold text-white">{store.name}</h2>
                                    <p className="text-blue-200 mt-1 flex items-center gap-1">
                                        <Globe className="h-4 w-4" />
                                        {store.country}
                                    </p>
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    {/* Address Card */}
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-500 text-sm mb-1">Adresse</p>
                                            <p className="text-slate-900 dark:text-slate-200 font-medium">{store.address}</p>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm">{store.postalCode} {store.city}</p>
                                        </div>
                                    </div>

                                    {/* Quick Info Grid */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <Phone className="h-5 w-5 text-green-500" />
                                            <div>
                                                <p className="text-xs text-slate-500">Téléphone</p>
                                                <p className="font-medium text-slate-900 dark:text-slate-200">{store.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <Clock className="h-5 w-5 text-amber-500" />
                                            <div>
                                                <p className="text-xs text-slate-500">Heures d'ouverture</p>
                                                <p className="font-medium text-slate-900 dark:text-slate-200">
                                                    {store.workingDays}: {store.openTime} - {store.closeTime}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <Mail className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-slate-500">Email</p>
                                                <p className="font-medium text-slate-900 dark:text-slate-200">{store.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <User className="h-5 w-5 text-purple-500" />
                                            <div>
                                                <p className="text-xs text-slate-500">Responsable</p>
                                                <p className="font-medium text-slate-900 dark:text-slate-200">{store.manager}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expertise Info */}
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">
                                                <span className="text-slate-500">Fondée en</span>{' '}
                                                <strong className="text-slate-900 dark:text-white">{store.foundedYear}</strong>
                                            </span>
                                        </div>
                                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm">
                                                <strong className="text-slate-900 dark:text-white">{store.yearsOfExpertise}</strong>{' '}
                                                <span className="text-slate-500">ans d'expertise</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Services & Features */}
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Services Disponibles</h3>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {store.services.map((service, i) => (
                                            <Badge key={i} variant="secondary" className="text-sm">
                                                {service}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {store.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium border border-green-100 dark:border-green-900/30">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button 
                                        className="flex-1 h-12 text-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 hover:shadow-lg transition-all"
                                        onClick={() => {
                                            const fullAddress = `${store.address}, ${store.city}, ${store.country}`;
                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`, '_blank');
                                        }}
                                    >
                                        <Navigation className="mr-2 h-5 w-5" />
                                        {t('stores.getDirections')}
                                    </Button>
                                    {store.website && (
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-12"
                                            onClick={() => window.open(store.website, '_blank')}
                                        >
                                            <Globe className="mr-2 h-5 w-5" />
                                            {t('stores.website')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredStores.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Building2 className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            Aucune boutique trouvée
                        </h3>
                        <p className="text-slate-500">Essayez de sélectionner un autre pays</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
