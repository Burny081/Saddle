# 🎨 Guide de Design - Saddle Point Service

## 🌟 Philosophie Design

**Saddle Point Service** adopte une approche **"Premium Business"** avec un design moderne, professionnel et accessible. L'interface privilégie l'efficacité opérationnelle tout en maintenant une esthétique soignée.

---

## 🎯 Principes Fondamentaux

### **1. 📱 Mobile-First**
- Design responsive natif
- Composants tactiles optimisés  
- Navigation intuitive sur mobile
- PWA capabilities

### **2. 🌓 Adaptive Themes**
- **Dark Mode** par défaut (professionnel)
- **Light Mode** disponible
- **Automatic** selon préférences système
- **High Contrast** pour accessibilité

### **3. ⚡ Performance First**
- Chargement instantané (<200ms)
- Animations fluides (60fps)
- Images optimisées (WebP)
- Lazy loading intelligent

### **4. ♿ Accessibilité**
- **WCAG 2.1 AA** compliant
- Navigation clavier complète
- Screen reader compatible
- Contrastes élevés

---

## 🎨 Système Couleurs

### **🎭 Palette Principale**

```css
/* Primary - Bleu Professionnel */
--primary-50:  #eff6ff
--primary-100: #dbeafe  
--primary-500: #3b82f6  /* Couleur principale */
--primary-600: #2563eb
--primary-900: #1e3a8a

/* Secondary - Gris Moderne */
--secondary-100: #f1f5f9
--secondary-200: #e2e8f0
--secondary-500: #64748b
--secondary-800: #1e293b
--secondary-900: #0f172a  /* Arrière-plans sombres */

/* Accent - Orange Énergique */
--accent-400: #fb923c
--accent-500: #f97316     /* Accent principal */
--accent-600: #ea580c

/* Status Colors */
--success:  #10b981      /* Vert confirmation */
--warning:  #f59e0b      /* Orange attention */
--error:    #ef4444      /* Rouge erreur */
--info:     #06b6d4      /* Bleu information */
```

### **🌈 Usage Sémantique**

| Couleur | Usage | Exemple |
|---------|-------|---------|
| **Primary Blue** | Actions principales, navigation | Boutons CTA, liens actifs |
| **Secondary Gray** | Textes, bordures, fonds | Corps de texte, cartes |
| **Accent Orange** | Highlights, notifications | Badges, alertes importantes |
| **Success Green** | Confirmations, succès | Validations, état "actif" |
| **Warning Orange** | Alertes, attention | Stock faible, actions requises |
| **Error Red** | Erreurs, suppressions | Messages erreur, actions dangereuses |

---

## 📐 Typographie

### **🔤 Police System**

```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes - Scale Modulaire */
--text-xs:   0.75rem  /* 12px */
--text-sm:   0.875rem /* 14px */  
--text-base: 1rem     /* 16px */
--text-lg:   1.125rem /* 18px */
--text-xl:   1.25rem  /* 20px */
--text-2xl:  1.5rem   /* 24px */
--text-3xl:  1.875rem /* 30px */
--text-4xl:  2.25rem  /* 36px */

/* Font Weights */
--font-normal: 400
--font-medium: 500    /* Texte important */
--font-semibold: 600  /* Titres secondaires */
--font-bold: 700      /* Titres principaux */
```

### **📝 Hiérarchie Textuelle**

```css
/* Titres */
.title-1 { font-size: var(--text-4xl); font-weight: var(--font-bold); }
.title-2 { font-size: var(--text-3xl); font-weight: var(--font-semibold); }
.title-3 { font-size: var(--text-2xl); font-weight: var(--font-semibold); }
.title-4 { font-size: var(--text-xl);  font-weight: var(--font-medium); }

/* Corps de texte */
.body-lg   { font-size: var(--text-lg);   line-height: 1.6; }
.body-base { font-size: var(--text-base); line-height: 1.5; }
.body-sm   { font-size: var(--text-sm);   line-height: 1.4; }

/* Texte utilitaire */
.caption { font-size: var(--text-xs); color: var(--secondary-500); }
.label   { font-size: var(--text-sm); font-weight: var(--font-medium); }
```

---

## 🧱 Composants UI

### **🔘 Boutons**

```tsx
/* Primary Button */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Variants: secondary, outline, ghost */
```

### **📄 Cartes**

```css
.card {
  background: white;
  border: 1px solid var(--secondary-200);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Dark mode */
.dark .card {
  background: var(--secondary-800);
  border-color: var(--secondary-700);
}
```

### **📊 Tableaux**

```css
.table-container {
  border: 1px solid var(--secondary-200);
  border-radius: 0.5rem;
  overflow: hidden;
}

.table-header {
  background: var(--secondary-50);
  padding: 1rem;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  border-bottom: 1px solid var(--secondary-200);
}

.table-row {
  padding: 1rem;
  border-bottom: 1px solid var(--secondary-100);
  transition: background 0.2s ease;
}

.table-row:hover {
  background: var(--secondary-50);
}
```

---

## 🧭 Navigation & Layout

### **📱 Sidebar Navigation**

```css
.sidebar {
  width: 280px;
  background: var(--secondary-900);
  border-right: 1px solid var(--secondary-800);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-collapsed {
  width: 80px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--secondary-300);
  border-radius: 0.5rem;
  margin: 0.25rem 0.5rem;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--secondary-800);
  color: var(--primary-400);
}

.nav-item.active {
  background: var(--primary-500);
  color: white;
}
```

### **📐 Grid System**

```css
/* Container principal */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Grid responsif */
.grid-responsive {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Breakpoints */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## ✨ Animations & Micro-interactions

### **🎭 Principes Animation**

- **Durée**: 200ms pour micro-interactions, 300ms pour transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` pour fluidité
- **Performance**: GPU-accelerated (transform, opacity)

```css
/* Transitions standard */
.transition-standard {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animations hover */
.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Loading animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 🔔 États & Feedbacks

### **📊 Loading States**

```tsx
/* Skeleton Loading */
.skeleton {
  background: linear-gradient(
    90deg, 
    var(--secondary-200) 25%, 
    var(--secondary-100) 50%, 
    var(--secondary-200) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### **⚠️ Messages d'État**

```css
.alert-success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--success);
  color: var(--success);
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid var(--warning);
  color: var(--warning);
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  color: var(--error);
}
```

---

## 📱 Responsive Design

### **🔧 Stratégie Mobile-First**

```css
/* Mobile (default) */
.dashboard {
  padding: 1rem;
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard {
    padding: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard {
    padding: 2rem;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🎨 Iconographie

### **🔍 Système d'Icônes**

- **Bibliothèque**: Lucide React (cohérence style)
- **Taille**: 16px (sm), 20px (base), 24px (lg)
- **Style**: Outline minimal, épaisseur 1.5px
- **Couleurs**: Héritées du contexte

```tsx
// Usage standard
<Icon size={20} strokeWidth={1.5} />

// States
<Icon className="text-primary-500" />    // Actif
<Icon className="text-secondary-400" />  // Inactif
<Icon className="text-success" />        // Succès
```

---

## ✅ Checklist Design

### **🎨 Composants UI**
- [ ] Design System cohérent
- [ ] Dark/Light mode
- [ ] États hover/focus/active
- [ ] Animations fluides
- [ ] Responsive complet

### **♿ Accessibilité**  
- [ ] Contrastes suffisants (4.5:1)
- [ ] Navigation clavier
- [ ] Attributs ARIA
- [ ] Textes alternatifs
- [ ] Focus visible

### **⚡ Performance**
- [ ] Images optimisées
- [ ] CSS critique inline
- [ ] Fonts subsetting
- [ ] Animations GPU
- [ ] Lazy loading

---

**🎨 Design System v1.0 - Production Ready**

*Guide mis à jour le 22 janvier 2026*