import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import * as LucideIcons from 'lucide-react';

// Static categories for navigation
const categories = [
  {
    id: 'power',
    name: { en: 'Power & Distribution', fr: 'Énergie & Distribution' },
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1487875961445-47a00398c267?auto=format&fit=crop&q=80&w=1200',
    subCategories: [
      { id: 'transformers', name: { en: 'Transformers', fr: 'Transformateurs' } },
      { id: 'breakers', name: { en: 'Circuit Breakers', fr: 'Disjoncteurs' } },
      { id: 'panels', name: { en: 'Electrical Panels', fr: 'Tableaux Électriques' } },
    ]
  },
  {
    id: 'renewable',
    name: { en: 'Renewable Energy', fr: 'Énergies Renouvelables' },
    icon: 'Sun',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200',
    subCategories: [
      { id: 'solar', name: { en: 'Solar Panels', fr: 'Panneaux Solaires' } },
      { id: 'inverters', name: { en: 'Inverters', fr: 'Onduleurs' } },
      { id: 'batteries', name: { en: 'Batteries', fr: 'Batteries' } },
    ]
  },
  {
    id: 'security',
    name: { en: 'Security', fr: 'Sécurité' },
    icon: 'Shield',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1200',
    subCategories: [
      { id: 'cameras', name: { en: 'CCTV Cameras', fr: 'Caméras Vidéosurveillance' } },
      { id: 'alarms', name: { en: 'Alarm Systems', fr: 'Systèmes d\'Alarme' } },
      { id: 'access', name: { en: 'Access Control', fr: 'Contrôle d\'Accès' } },
    ]
  },
  {
    id: 'automation',
    name: { en: 'Automation', fr: 'Automatisme' },
    icon: 'Cpu',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=1200',
    subCategories: [
      { id: 'plc', name: { en: 'PLCs', fr: 'Automates Programmables' } },
      { id: 'hmi', name: { en: 'HMIs', fr: 'IHM' } },
      { id: 'sensors', name: { en: 'Industrial Sensors', fr: 'Capteurs Industriels' } },
    ]
  },
];

interface CategoryDropdownProps {
    onNavigate: (page: string, category?: string, subCategory?: string) => void;
    trigger?: 'hover' | 'click';
    isMobile?: boolean;
}

export function CategoryDropdown({ onNavigate, trigger = 'hover', isMobile = false }: CategoryDropdownProps) {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const text = {
        categories: { en: 'Categories', fr: 'Catégories' },
        allProducts: { en: 'All Products', fr: 'Tous les Produits' },
        viewAll: { en: 'View All', fr: 'Voir Tout' },
        search: { en: 'Search categories...', fr: 'Rechercher des catégories...' },
        noResults: { en: 'No categories found', fr: 'Aucune catégorie trouvée' }
    };

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return categories;
        return categories.filter(category => {
            const categoryMatch = category.name[language].toLowerCase().includes(searchTerm.toLowerCase());
            const subCategoryMatch = category.subCategories?.some(sub => 
                sub.name[language].toLowerCase().includes(searchTerm.toLowerCase())
            );
            return categoryMatch || subCategoryMatch;
        });
    }, [searchTerm, language]);

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const handleCategoryClick = (categoryId: string) => {
        onNavigate('products', categoryId);
        setIsOpen(false);
        setHoveredCategory(null);
    };

    const handleSubCategoryClick = (categoryId: string, subCategoryId: string) => {
        onNavigate('products', categoryId, subCategoryId);
        setIsOpen(false);
        setHoveredCategory(null);
    };

    const getIcon = (iconName: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Icon = (LucideIcons as any)[iconName];
        return Icon ? <Icon className="w-5 h-5" /> : null;
    };

    if (isMobile) {
        return (
            <div className="w-full">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full py-2 text-slate-600 hover:text-blue-600 transition-all duration-200"
                >
                    <span className="font-medium">{text.categories[language]}</span>
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
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    onNavigate('shop');
                                    setIsOpen(false);
                                }}
                                className="block w-full text-left py-2 text-sm text-slate-600 hover:text-blue-600 transition-all"
                            >
                                {text.allProducts[language]}
                            </button>

                            {filteredCategories.length === 0 ? (
                                <div className="text-center py-4 text-slate-500 text-sm">
                                    {text.noResults[language]}
                                </div>
                            ) : (
                                filteredCategories.map((category) => (
                                    <div key={category.id} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => handleCategoryClick(category.id)}
                                                className="flex-1 text-left py-2 text-sm text-slate-600 hover:text-blue-600 transition-all flex items-center gap-2"
                                            >
                                                {getIcon(category.icon)}
                                                <span className={searchTerm && category.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 rounded px-1' : ''}>
                                                    {category.name[language]}
                                                </span>
                                            </button>

                                        {category.subCategories && category.subCategories.length > 0 && (
                                            <button
                                                onClick={() => toggleCategory(category.id)}
                                                className="p-1"
                                                aria-label="Expand category"
                                            >
                                                <motion.div
                                                    animate={{ rotate: expandedCategories.has(category.id) ? 90 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </motion.div>
                                            </button>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {expandedCategories.has(category.id) && category.subCategories && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="pl-6 space-y-1 overflow-hidden"
                                            >
                                                {category.subCategories.map((sub) => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => handleSubCategoryClick(category.id, sub.id)}
                                                        className="block w-full text-left py-1.5 text-xs text-slate-500 hover:text-blue-600 transition-all"
                                                    >
                                                        {sub.name[language]}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
                <span>{text.categories[language]}</span>
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
                                left: 'max(1rem, min(50vw - 400px, calc(100vw - min(90vw, 800px) - 1rem)))',
                                width: 'min(90vw, 800px)',
                                maxWidth: '90vw',
                                maxHeight: 'calc(100vh - 120px)'
                            }}
                        >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
                            {/* Categories List */}
                            <div className="col-span-1 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 p-4 max-h-60 md:max-h-none overflow-y-auto">
                                <h6 className="mb-3 text-rose-500 !text-sm !font-semibold uppercase tracking-wider pl-3">
                                    {text.categories[language]}
                                </h6>

                                {/* Search Input */}
                                <div className="relative mb-4">
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
                                            aria-label="Clear search"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => {
                                            onNavigate('shop');
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-200 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                                    >
                                        {text.allProducts[language]}
                                    </button>

                                    {filteredCategories.length === 0 ? (
                                        <div className="text-center py-4 text-slate-500 text-sm">
                                            {text.noResults[language]}
                                        </div>
                                    ) : (
                                        filteredCategories.map((category) => (
                                            <motion.button
                                                key={category.id}
                                                onClick={() => handleCategoryClick(category.id)}
                                                onMouseEnter={() => setHoveredCategory(category.id)}
                                                className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-200 text-sm flex items-center gap-2 font-medium ${hoveredCategory === category.id
                                                    ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                                                }`}
                                                whileHover={{ x: 4 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <span className={hoveredCategory === category.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>
                                                    {getIcon(category.icon)}
                                                </span>
                                                <span className={searchTerm && category.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 dark:bg-yellow-900/30 rounded px-1' : ''}>
                                                    {category.name[language]}
                                                </span>
                                                {category.subCategories && category.subCategories.length > 0 && (
                                                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                                                )}
                                            </motion.button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Subcategories and Preview */}
                            <div className="col-span-1 md:col-span-2 p-4 md:p-6 bg-white dark:bg-slate-900 overflow-y-auto">
                                {hoveredCategory ? (
                                    <motion.div
                                        key={hoveredCategory}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full flex flex-col"
                                    >
                                        {(() => {
                                            const category = categories.find(c => c.id === hoveredCategory);
                                            if (!category) return null;

                                            return (
                                                <>
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <motion.div
                                                                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400"
                                                                whileHover={{ scale: 1.1, rotateY: 15 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                {getIcon(category.icon)}
                                                            </motion.div>
                                                            <div>
                                                                <h5 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">
                                                                    {category.name[language]}
                                                                </h5>
                                                                <button
                                                                    onClick={() => handleCategoryClick(category.id)}
                                                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium mt-1 inline-flex items-center"
                                                                >
                                                                    {text.viewAll[language]} <ArrowRight className="w-3 h-3 ml-1" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {category.subCategories && category.subCategories.length > 0 && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 md:mb-6">
                                                            {category.subCategories.map((sub) => (
                                                                <motion.button
                                                                    key={sub.id}
                                                                    onClick={() => handleSubCategoryClick(category.id, sub.id)}
                                                                    className="text-left px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm group border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                                                                    whileHover={{ scale: 1.02, translateX: 5 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <span className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                                        {sub.name[language]}
                                                                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                                                    </span>
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Category Image Preview */}
                                                    <div className="mt-auto">
                                                        <motion.div
                                                            className="rounded-2xl overflow-hidden shadow-lg relative h-48 group"
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                                                            <img
                                                                src={category.image}
                                                                alt={category.name[language]}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                            />
                                                            <div className="absolute bottom-4 left-4 z-20">
                                                                <p className="text-white text-xs font-medium bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
                                                                    Featured Collection
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-4">
                                            <ChevronRight className="w-8 h-8 opacity-20" />
                                        </div>
                                        <p className="text-sm text-center font-medium max-w-[200px]">
                                            {language === 'en'
                                                ? 'Hover over a category to explore our wide range of products'
                                                : 'Survolez une catégorie pour explorer notre large gamme de produits'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
