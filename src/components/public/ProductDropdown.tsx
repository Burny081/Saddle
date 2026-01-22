import { ChevronDown, ChevronRight, ArrowRight, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import * as LucideIcons from 'lucide-react';

// Static navigation data for products mega menu
const navProducts = [
  {
    id: 'new-arrivals',
    title: { en: 'New Arrivals', fr: 'Nouveautés' },
    description: { en: 'The latest tech in power management', fr: 'Les dernières technologies de gestion d\'énergie' },
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'smart-breakers', name: { en: 'Smart Breakers', fr: 'Disjoncteurs Intelligents' } },
      { id: 'iot-sensors', name: { en: 'IoT Power Sensors', fr: 'Capteurs IoT' } },
      { id: 'eco-drives', name: { en: 'Eco Drives', fr: 'Variateurs Éco' } },
    ]
  },
  {
    id: 'best-sellers',
    title: { en: 'Best Sellers', fr: 'Meilleures Ventes' },
    description: { en: 'Our most popular trusted solutions', fr: 'Nos solutions les plus populaires' },
    icon: 'TrendingUp',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'transformers', name: { en: 'HV Transformers', fr: 'Transformateurs HT' } },
      { id: 'solar-kits', name: { en: 'Solar Kits', fr: 'Kits Solaires' } },
      { id: 'cabling', name: { en: 'Industrial Cabling', fr: 'Câblage Industriel' } },
    ]
  },
  {
    id: 'promotions',
    title: { en: 'Promotions', fr: 'Promotions' },
    description: { en: 'Limited time offers and discounts', fr: 'Offres limitées et réductions' },
    icon: 'Percent',
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'clearance', name: { en: 'Clearance', fr: 'Déstockage' } },
      { id: 'bundles', name: { en: 'Project Bundles', fr: 'Packs Projet' } },
    ]
  }
];

interface ProductDropdownProps {
    onNavigate: (page: string, params?: any) => void;
    trigger?: 'hover' | 'click';
    isMobile?: boolean;
}

export function ProductDropdown({ onNavigate, trigger = 'hover', isMobile = false }: ProductDropdownProps) {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const text = {
        products: { en: 'Products', fr: 'Produits' },
        viewAll: { en: 'View All Products', fr: 'Voir tous les produits' },
        shopNow: { en: 'Shop Now', fr: 'Acheter Maintenant' },
        search: { en: 'Search products...', fr: 'Rechercher des produits...' },
        noResults: { en: 'No products found', fr: 'Aucun produit trouvé' }
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return navProducts;
        return navProducts.filter(product => {
            const productMatch = product.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description[language].toLowerCase().includes(searchTerm.toLowerCase());
            const itemMatch = product.items?.some(item => 
                item.name[language].toLowerCase().includes(searchTerm.toLowerCase())
            );
            return productMatch || itemMatch;
        });
    }, [searchTerm, language]);

    const getIcon = (iconName: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Icon = (LucideIcons as any)[iconName];
        return Icon ? <Icon className="w-5 h-5" /> : null;
    };

    const handleNavigate = (category?: string, subCategory?: string) => {
        setIsOpen(false);
        onNavigate('shop', { category, subCategory });
    };

    if (isMobile) {
        return (
            <div className="w-full">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full py-2 text-slate-600 hover:text-blue-600 transition-all duration-200"
                >
                    <span className="font-medium">{text.products[language]}</span>
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

                            <button
                                onClick={() => handleNavigate()}
                                className="block w-full text-left py-2 text-sm text-slate-600 hover:text-blue-600 transition-all"
                            >
                                {text.viewAll[language]}
                            </button>
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-4 text-slate-500 text-sm">
                                    {text.noResults[language]}
                                </div>
                            ) : (
                                filteredProducts.map((item) => (
                                    <div key={item.id} className="py-1">
                                        <button
                                            onClick={() => handleNavigate(item.id)}
                                            className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 hover:text-blue-600 text-left w-full"
                                        >
                                            <span className={searchTerm && item.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 rounded px-1' : ''}>
                                                {item.title[language]}
                                            </span>
                                        </button>
                                        {item.items?.map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => handleNavigate(item.id, sub.id)}
                                                className="block w-full text-left py-1.5 text-sm text-slate-600 hover:text-blue-600 pl-2"
                                            >
                                                <span className={searchTerm && sub.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 rounded px-1' : ''}>
                                                    {sub.name[language]}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

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
                <span>{text.products[language]}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </button>

            {/* Portal-like positioned dropdown */}
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
                                left: 'max(1rem, min(50vw - 450px, calc(100vw - min(90vw, 900px) - 1rem)))',
                                width: 'min(90vw, 900px)',
                                maxWidth: '90vw',
                                maxHeight: 'calc(100vh - 120px)'
                            }}
                        >
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-full">
                            {/* Visual Side */}
                            <div className="col-span-1 bg-slate-50 dark:bg-slate-950/50 p-4 lg:p-6 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden min-h-32 lg:min-h-0">
                                <div className="relative z-10">
                                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-2">{text.products[language]}</h3>
                                    <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mb-4 lg:mb-6 line-clamp-2">Explore our comprehensive range of electrical solutions.</p>
                                    <button
                                        onClick={() => handleNavigate()}
                                        className="text-xs lg:text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all"
                                    >
                                        {text.viewAll[language]} <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                                    </button>
                                </div>
                                {/* Abstract Shapes */}
                                <div className="absolute -bottom-10 -right-10 w-20 h-20 lg:w-40 lg:h-40 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50" />
                                <div className="absolute top-10 -left-10 w-16 h-16 lg:w-32 lg:h-32 bg-red-100 dark:bg-red-900/20 rounded-full blur-3xl opacity-50" />
                            </div>

                            {/* Content Side */}
                            <div className="col-span-1 lg:col-span-3 p-4 lg:p-6 overflow-y-auto max-h-80 lg:max-h-none">
                                {/* Search Input */}
                                <div className="relative mb-4 lg:mb-6">
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                    {filteredProducts.length === 0 ? (
                                        <div className="col-span-full text-center py-8 text-slate-500">
                                            {text.noResults[language]}
                                        </div>
                                    ) : (
                                        filteredProducts.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        className="space-y-3 lg:space-y-4 group/card"
                                    >
                                        <button
                                            onClick={() => handleNavigate(item.id)}
                                            className="w-full text-left relative overflow-hidden rounded-xl h-24 lg:h-32 block"
                                        >
                                            <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/10 transition-colors z-10" />
                                            <img
                                                src={item.image}
                                                alt={item.title[language]}
                                                className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute bottom-2 lg:bottom-3 left-2 lg:left-3 z-20">
                                                <div className="p-1.5 lg:p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg w-fit mb-1 shadow-sm">
                                                    <span className="text-blue-600 dark:text-blue-400 text-sm lg:text-base">{getIcon(item.icon)}</span>
                                                </div>
                                                <h4 className="font-bold text-white text-sm lg:text-lg shadow-black/50 drop-shadow-md line-clamp-2">
                                                    <span className={searchTerm && item.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-200 text-slate-900 rounded px-1' : ''}>
                                                        {item.title[language]}
                                                    </span>
                                                </h4>
                                            </div>
                                        </button>

                                        <div className="space-y-1">
                                            {item.items?.map((sub) => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => handleNavigate(item.id, sub.id)}
                                                    className="block w-full text-left py-1.5 px-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between group/link"
                                                >
                                                    <span className={searchTerm && sub.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 dark:bg-yellow-900/30 rounded px-1' : ''}>
                                                        {sub.name[language]}
                                                    </span>
                                                    <ChevronRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            </div>
                            </div>
                        </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
