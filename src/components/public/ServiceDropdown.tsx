import { ChevronDown, ChevronRight, ArrowRight, Search, X, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import * as LucideIcons from 'lucide-react';

// Static navigation data for services mega menu
const navServices = [
  {
    id: 'installation',
    title: { en: 'Installation', fr: 'Installation' },
    description: { en: 'Professional setup by certified experts', fr: 'Configuration par des experts certifiés' },
    icon: 'Wrench',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'industrial', name: { en: 'Industrial Setup', fr: 'Installation Industrielle' } },
      { id: 'residential', name: { en: 'Home Systems', fr: 'Systèmes Résidentiels' } },
      { id: 'solar-install', name: { en: 'Solar Installation', fr: 'Installation Solaire' } },
    ]
  },
  {
    id: 'maintenance',
    title: { en: 'Maintenance', fr: 'Maintenance' },
    description: { en: '24/7 support and preventive care', fr: 'Support 24/7 et maintenance préventive' },
    icon: 'Activity',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'contracts', name: { en: 'Service Contracts', fr: 'Contrats de Service' } },
      { id: 'emergency', name: { en: 'Emergency Repairs', fr: 'Réparations d\'Urgence' } },
      { id: 'audits', name: { en: 'Energy Audits', fr: 'Audits Énergétiques' } },
    ]
  },
  {
    id: 'consulting',
    title: { en: 'Consulting', fr: 'Conseil' },
    description: { en: 'Expert guidance for your projects', fr: 'Accompagnement expert pour vos projets' },
    icon: 'Lightbulb',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'energy-consulting', name: { en: 'Energy Consulting', fr: 'Conseil Énergétique' } },
      { id: 'project-management', name: { en: 'Project Management', fr: 'Gestion de Projet' } },
      { id: 'training', name: { en: 'Technical Training', fr: 'Formation Technique' } },
    ]
  }
];

interface ServiceDropdownProps {
    onNavigate: (page: string, params?: any) => void;
    trigger?: 'hover' | 'click';
    isMobile?: boolean;
}

export function ServiceDropdown({ onNavigate, trigger = 'hover', isMobile = false }: ServiceDropdownProps) {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [activeService, setActiveService] = useState<string>(navServices[0].id);
    const [searchTerm, setSearchTerm] = useState('');

    const text = {
        services: { en: 'Services', fr: 'Services' },
        consultation: { en: 'Get a Consultation', fr: 'Obtenir une Consultation' },
        learnMore: { en: 'Learn More', fr: 'En savoir plus' },
        search: { en: 'Search services...', fr: 'Rechercher des services...' },
        noResults: { en: 'No services found', fr: 'Aucun service trouvé' }
    };

    const filteredServices = useMemo(() => {
        if (!searchTerm.trim()) return navServices;
        return navServices.filter(service => {
            const serviceMatch = service.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                               service.description[language].toLowerCase().includes(searchTerm.toLowerCase());
            const itemMatch = service.items?.some(item => 
                item.name[language].toLowerCase().includes(searchTerm.toLowerCase())
            );
            return serviceMatch || itemMatch;
        });
    }, [searchTerm, language]);

    const getIcon = (iconName: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Icon = (LucideIcons as any)[iconName];
        return Icon ? <Icon className="w-5 h-5" /> : null;
    };

    const handleNavigate = (category?: string, subCategory?: string) => {
        setIsOpen(false);
        onNavigate('services', { category, subCategory });
    };

    if (isMobile) {
        return (
            <div className="w-full">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full py-2 text-slate-600 hover:text-blue-600 transition-all duration-200"
                >
                    <span className="font-medium">{text.services[language]}</span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 space-y-2 overflow-hidden"
                        >
                            {/* Search Input */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={text.search[language]}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {filteredServices.length === 0 ? (
                                <div className="text-center py-4 text-slate-500 text-sm">
                                    {text.noResults[language]}
                                </div>
                            ) : (
                                filteredServices.map((service) => (
                                    <div key={service.id} className="py-2 border-l-2 border-slate-100 pl-4">
                                        <h4 className="font-semibold text-slate-700 text-sm mb-1">
                                            <span className={searchTerm && service.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 rounded px-1' : ''}>
                                                {service.title[language]}
                                            </span>
                                        </h4>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleNavigate(service.id)}
                                                className="text-left text-xs font-semibold text-blue-600 py-1"
                                            >
                                                {text.learnMore[language]}
                                            </button>
                                            {service.items?.map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => handleNavigate(service.id, sub.id)}
                                                    className="text-left text-xs text-slate-500 py-1"
                                                >
                                                    <span className={searchTerm && sub.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 rounded px-1' : ''}>
                                                        {sub.name[language]}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    const activeServiceData = navServices.find(s => s.id === activeService);

    return (
        <div
            className="relative group h-full flex items-center"
            onMouseEnter={() => trigger === 'hover' && setIsOpen(true)}
            onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
        >
            <button
                onClick={() => trigger === 'click' && setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-slate-600 hover:text-blue-600 hover:bg-transparent font-medium transition-all duration-300 relative h-10 px-4 py-2"
            >
                <span>{text.services[language]}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Fixed positioned overlay */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="fixed z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                            style={{
                                top: '60px',
                                left: 'max(1rem, min(50vw - 425px, calc(100vw - min(90vw, 850px) - 1rem)))',
                                width: 'min(90vw, 850px)',
                                maxWidth: '90vw',
                                maxHeight: 'calc(100vh - 120px)'
                            }}
                        >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full max-h-96 lg:max-h-[450px]">
                            {/* Service List Sidebar */}
                            <div className="col-span-1 lg:col-span-4 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 py-4 lg:py-6 max-h-48 lg:max-h-none overflow-y-auto">
                                <h3 className="px-4 lg:px-6 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{text.services[language]}</h3>
                                
                                {/* Search Input */}
                                <div className="px-3 mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder={text.search[language]}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-10 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1 px-3">
                                    {filteredServices.length === 0 ? (
                                        <div className="text-center py-4 text-slate-500 text-sm">
                                            {text.noResults[language]}
                                        </div>
                                    ) : (
                                        filteredServices.map((service) => (
                                        <button
                                            key={service.id}
                                            onMouseEnter={() => setActiveService(service.id)}
                                            onClick={() => handleNavigate(service.id)}
                                            className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all flex items-center gap-2 lg:gap-3 ${activeService === service.id
                                                ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600 dark:text-blue-400 ring-1 ring-slate-100 dark:ring-slate-700'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <div className={`p-1.5 lg:p-2 rounded-lg ${activeService === service.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}>
                                                <span className="text-sm">{getIcon(service.icon)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-xs lg:text-sm truncate">
                                                    <span className={searchTerm && service.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 dark:bg-yellow-900/30 rounded px-1' : ''}>
                                                        {service.title[language]}
                                                    </span>
                                                </p>
                                                <p className="text-[10px] opacity-70 truncate">
                                                    <span className={searchTerm && service.description[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 dark:bg-yellow-900/30 rounded px-1' : ''}>
                                                        {service.description[language]}
                                                    </span>
                                                </p>
                                            </div>
                                            {activeService === service.id && (
                                                <motion.div layoutId="active-indicator" className="ml-auto">
                                                    <ChevronDown className="-rotate-90 w-3 h-3 lg:w-4 lg:h-4" />
                                                </motion.div>
                                            )}
                                        </button>
                                    ))
                                )}
                                </div>
                            </div>

                            {/* Active Service Detail */}
                            <div className="col-span-8 p-8 relative">
                                <AnimatePresence mode="wait">
                                    {activeServiceData && (
                                        <motion.div
                                            key={activeService}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="h-full flex flex-col"
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{activeServiceData.title[language]}</h2>
                                                    <p className="text-slate-500 dark:text-slate-400 max-w-md">{activeServiceData.description[language]}</p>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                                                    Expert Service
                                                </div>
                                            </div>

                                            <div className="h-48 rounded-2xl overflow-hidden relative mb-8 shadow-lg">
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10" />
                                                <img
                                                    src={activeServiceData.image}
                                                    alt={activeServiceData.title[language]}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute bottom-6 left-6 z-20 max-w-sm">
                                                    <button
                                                        onClick={() => handleNavigate(activeServiceData.id)}
                                                        className="bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                                    >
                                                        {text.learnMore[language]} <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {activeServiceData.items?.map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => handleNavigate(activeServiceData.id, sub.id)}
                                                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                                                            <span className={searchTerm && sub.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 dark:bg-yellow-900/30 rounded px-1' : ''}>
                                                                {sub.name[language]}
                                                            </span>
                                                        </span>
                                                        <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
