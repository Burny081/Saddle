import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { Zap, Shield, Award, Globe, CheckCircle, ArrowRight, Sun, Cpu, Battery, Moon, ShoppingCart, Menu, X, User, MapPin, Phone } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { CategoryDropdown } from './public/CategoryDropdown';
import { ProductDropdown } from './public/ProductDropdown';
import { ServiceDropdown } from './public/ServiceDropdown';
import { useCompanyInfo } from '@/contexts/CompanyContext';

interface PublicHomeProps {
  onLoginClick: () => void;
  onBrowseShop: (category?: string, subCategory?: string) => void;
  onViewPointsOfSale: () => void;
}

export function PublicHome({ onLoginClick, onBrowseShop, onViewPointsOfSale }: PublicHomeProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const companyInfo = useCompanyInfo();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug logging
  console.log('PublicHome companyInfo:', companyInfo);

  const values = [
    { icon: Shield, title: t('home.values.reliability'), color: 'from-blue-500 to-blue-600' },
    { icon: Zap, title: t('home.values.innovation'), color: 'from-red-500 to-red-600' },
    { icon: Award, title: t('home.values.security'), color: 'from-blue-600 to-blue-700' },
    { icon: Globe, title: t('home.values.performance'), color: 'from-red-600 to-red-700' },
  ];

  const products = [
    {
      icon: Zap,
      title: 'Moyenne et Basse Tension',
      description: 'Transformateurs, disjoncteurs, protection électrique',
      image: 'https://images.unsplash.com/photo-1635335874521-7987db781153?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXJjdWl0JTIwYnJlYWtlciUyMGVsZWN0cmljYWx8ZW58MXx8fHwxNzY4NTEwNjkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Sun,
      title: 'Énergies Renouvelables',
      description: 'Solutions photovoltaïques et stockage d\'énergie',
      image: 'https://images.unsplash.com/photo-1628206554160-63e8c921e398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVscyUyMHJlbmV3YWJsZXxlbnwxfHx8fDE3Njg1MTA2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Cpu,
      title: 'Automatismes Industriels',
      description: 'PLC, SCADA, IHM, contrôle-commande',
      image: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYXV0b21hdGlvbnxlbnwxfHx8fDE3Njg1MTA2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Battery,
      title: 'Distribution et Câblage',
      description: 'Armoires électriques, câbles, connectique',
      image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwcGFuZWx8ZW58MXx8fHwxNzY4NTEwNjkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Top Info Bar - Hidden on mobile */}
      <div className="hidden md:block bg-slate-900 text-white text-xs py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              {companyInfo.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {companyInfo.address}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            >
              <Globe className="h-3 w-3 mr-1" />
              {language === 'fr' ? 'FR' : 'EN'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 shadow-sm">
        <div className="container mx-auto flex h-14 sm:h-16 lg:h-18 items-center justify-between px-3 sm:px-4 lg:px-6">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            <div className="flex bg-white h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11 items-center justify-center rounded-xl shadow-md border border-slate-100 overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="SPS" className="h-full w-full object-contain p-0.5" />
            </div>
            <h1 className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
              <span className="company-name">{companyInfo.name}</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Button
              variant="ghost"
              className="text-red-600 font-semibold hover:text-red-700 hover:bg-red-50 rounded-lg px-3 xl:px-4 h-9"
            >
              {t('nav.home')}
            </Button>

            <ProductDropdown
              onNavigate={(_, params) => {
                onBrowseShop(params?.category, params?.subCategory);
              }}
            />

            <CategoryDropdown
              onNavigate={(page, category, subCategory) => {
                if (page === 'products' || page === 'shop') {
                  onBrowseShop(category, subCategory);
                }
              }}
            />

            <ServiceDropdown
              onNavigate={(_, params) => {
                onBrowseShop(params?.category, params?.subCategory);
              }}
            />

            <Button
              variant="ghost"
              className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium rounded-lg px-3 xl:px-4 h-9"
              onClick={onViewPointsOfSale}
            >
              {t('nav.locations')}
            </Button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            {/* Shopping Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => onBrowseShop()}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </Button>

            {/* Language Toggle - Mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            >
              <Globe className="h-4 w-4 text-slate-600" />
            </Button>

            {/* Connexion Button */}
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-semibold shadow-md shadow-red-600/20 rounded-lg px-2.5 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm"
              onClick={onLoginClick}
            >
              <User className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{t('auth.login')}</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-40"
            >
              <div className="p-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Company Info - Mobile */}
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                    <Phone className="h-3 w-3" /> {companyInfo.phone}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> {companyInfo.address}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-medium text-red-600"
                  onClick={() => { setIsMobileMenuOpen(false); }}
                >
                  {t('nav.home')}
                </Button>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                  <ProductDropdown
                    isMobile={true}
                    onNavigate={(_, params) => {
                      onBrowseShop(params?.category, params?.subCategory);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                  <CategoryDropdown
                    isMobile={true}
                    onNavigate={(_, category, subCategory) => {
                      onBrowseShop(category, subCategory);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                  <ServiceDropdown
                    isMobile={true}
                    onNavigate={(_, params) => {
                      onBrowseShop(params?.category, params?.subCategory);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center h-10"
                    onClick={() => {
                      onViewPointsOfSale();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {t('nav.locations')}
                  </Button>
                  <Button
                    className="w-full justify-center bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white h-10"
                    onClick={() => {
                      onLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {t('client.area')}
                  </Button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4 mr-1.5" /> : <Moon className="h-4 w-4 mr-1.5" />}
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="pt-0">

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-blue-600/10 to-blue-900/20 dark:from-red-600/20 dark:via-blue-600/20 dark:to-blue-900/30" />

          <div className="container relative mx-auto px-4 py-8 sm:py-12 lg:py-20">
            <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-blue-600 px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t('home.leader')}
                </div>

                <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                    {t('home.hero.title')}
                  </span>
                </h1>

                <p className="mb-6 sm:mb-8 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
                  {t('home.hero.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    onClick={() => onBrowseShop()}
                    className="bg-red-600 text-white text-sm sm:text-base lg:text-lg hover:bg-red-700 shadow-lg shadow-red-600/20 h-11 sm:h-12"
                  >
                    {t('home.cta.login')}
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-blue-600 text-sm sm:text-base lg:text-lg text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950 h-11 sm:h-12"
                    onClick={() => onBrowseShop()}
                  >
                    {t('home.cta.catalog')}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative mt-8 lg:mt-0"
              >
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1759830337357-29c472b6746c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwZXF1aXBtZW50JTIwaW5kdXN0cmlhbHxlbnwxfHx8fDE3Njg0Nzg3MTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Electrical equipment"
                    className="h-[280px] sm:h-[350px] md:h-[400px] lg:h-[500px] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
                </div>

                {/* Floating stats cards - Hidden on very small screens */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="hidden sm:block absolute -bottom-4 sm:-bottom-6 left-2 sm:-left-6 rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 lg:p-6 shadow-xl dark:bg-slate-800"
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">25+</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {t('home.yearsOfExperience')}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="hidden sm:block absolute right-2 sm:-right-6 -top-4 sm:-top-6 rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 lg:p-6 shadow-xl dark:bg-slate-800"
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">10k+</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {t('home.projectsCompleted')}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl text-center"
            >
              <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                  {t('home.vision.title')}
                </span>
              </h2>
              <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                {t('home.vision.content')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-gradient-to-br from-slate-100 to-blue-50 py-20 dark:from-slate-900 dark:to-blue-950">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-4xl font-bold">
              {t('home.values.title')}
            </h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group relative overflow-hidden border-none bg-white p-8 text-center shadow-lg transition-all hover:shadow-2xl dark:bg-slate-800">
                    <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 transition-opacity group-hover:opacity-10`} />
                    <div className="relative">
                      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${value.color} text-white shadow-lg`}>
                        <value.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold">{value.title}</h3>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Showcase */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-center text-4xl font-bold">
              Nos Familles de Produits
            </h2>
            <p className="mb-12 text-center text-xl text-slate-600 dark:text-slate-300">
              Couverture complète de toutes les solutions électriques
            </p>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden border-none shadow-lg transition-all hover:shadow-2xl">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                          <product.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-xl font-bold">{product.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Standards & Quality */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-900 py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="mb-6 text-4xl font-bold">
                  {t('home.standards.title')}
                </h2>
                <p className="mb-8 text-xl text-blue-100">
                  {t('home.standards.content')}
                </p>

                <div className="space-y-4">
                  {['Certification IEC 61000', 'Norme ISO 9001:2015', 'Conformité NF C 15-100', 'Label CE'].map((standard) => (
                    <div key={standard} className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-yellow-400" />
                      <span className="text-lg">{standard}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'IEC', color: 'from-yellow-400 to-yellow-600' },
                    { label: 'ISO', color: 'from-red-400 to-red-600' },
                    { label: 'NF', color: 'from-blue-400 to-blue-600' },
                    { label: 'CE', color: 'from-green-400 to-green-600' },
                  ].map((cert) => (
                    <div
                      key={cert.label}
                      className={`flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br ${cert.color} text-4xl font-bold shadow-xl`}
                    >
                      {cert.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Role in Energy Chain */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl text-center"
            >
              <h2 className="mb-6 text-4xl font-bold">
                <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                  {t('home.role.title')}
                </span>
              </h2>
              <p className="mb-12 text-xl text-slate-600 dark:text-slate-300">
                {t('home.role.content')}
              </p>

              {/* Energy chain flow */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  'Production',
                  'Transport MT',
                  'Distribution BT',
                  'Contrôle',
                  'Automatisation',
                  'Usage Final',
                ].map((step, index) => (
                  <React.Fragment key={step}>
                    <div className="rounded-full bg-gradient-to-r from-red-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg">
                      {step}
                    </div>
                    {index < 5 && (
                      <ArrowRight className="h-6 w-6 text-slate-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-red-600 to-blue-600 py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold">
                Prêt à démarrer votre projet ?
              </h2>
              <p className="mb-8 text-xl">
                Connectez-vous pour accéder à nos services et commander vos équipements
              </p>
              <Button
                size="lg"
                onClick={() => onBrowseShop()}
                className="bg-white text-xl text-blue-600 hover:bg-blue-50"
              >
                Accéder à l'espace client
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

      </div> {/* Close pt-20 div */}
    </div>
  );
}