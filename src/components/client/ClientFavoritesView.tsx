import { useEffect, useMemo, useState } from 'react';
import { Grid3X3, Heart, List, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { AppPageHeader } from '@/components/app-shell/AppPageHeader';
import { AppPanel } from '@/components/app-shell/AppPanel';
import { DataState } from '@/components/app-shell/DataState';
import { StatusBadge } from '@/components/app-shell/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/config/constants';
import { hasFavorite, readFavorites, writeFavorites, type FavoriteReference, type FavoriteType } from '@/utils/favorites';

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  type: FavoriteType;
  category?: string;
  description?: string;
  image?: string;
  stock?: number;
}

export default function ClientFavoritesView() {
  const { user } = useAuth();
  const { articles, services } = useData();
  const [favoriteRefs, setFavoriteRefs] = useState<FavoriteReference[]>(() => readFavorites(user?.id));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => setFavoriteRefs(readFavorites(user?.id)), [user?.id]);

  const favorites = useMemo<FavoriteItem[]>(() => [
    ...articles.filter((item) => hasFavorite(favoriteRefs, 'article', item.id)).map((item) => ({ ...item, type: 'article' as const })),
    ...services.filter((item) => hasFavorite(favoriteRefs, 'service', item.id)).map((item) => ({ ...item, type: 'service' as const })),
  ], [articles, services, favoriteRefs]);

  const filteredFavorites = favorites.filter((item) => item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));

  const removeFavorite = (type: FavoriteType, itemId: string) => {
    const nextFavorites = favoriteRefs.filter((favorite) => !(favorite.id === itemId && (!favorite.type || favorite.type === type)));
    setFavoriteRefs(nextFavorites);
    writeFavorites(user?.id, nextFavorites);
  };

  const addToCart = (item: FavoriteItem) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]') as Array<FavoriteItem & { quantity: number }>;
    const index = cart.findIndex((cartItem) => cartItem.id === item.id && cartItem.type === item.type);
    if (index >= 0) cart[index].quantity += 1;
    else cart.push({ ...item, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="Espace client"
        title="Mes favoris"
        description={`${favorites.length} ${favorites.length > 1 ? 'articles enregistrés' : 'article enregistré'} dans votre sélection.`}
        actions={<div className="flex border border-border bg-card p-1" aria-label="Mode d’affichage"><Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className={`h-10 w-10 ${viewMode === 'grid' ? 'bg-[#124a93] text-white hover:bg-[#0b3978]' : ''}`} onClick={() => setViewMode('grid')} aria-label="Vue grille"><Grid3X3 className="h-4 w-4" /></Button><Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className={`h-10 w-10 ${viewMode === 'list' ? 'bg-[#124a93] text-white hover:bg-[#0b3978]' : ''}`} onClick={() => setViewMode('list')} aria-label="Vue liste"><List className="h-4 w-4" /></Button></div>}
      />

      <AppPanel>
        <div className="relative border-b border-border p-4 sm:p-5"><Search className="absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="h-11 pl-9" placeholder="Rechercher dans mes favoris" aria-label="Rechercher dans mes favoris" /></div>
        {filteredFavorites.length === 0 ? (
          <DataState kind="empty" title={searchTerm ? 'Aucun résultat' : 'Aucun favori'} description={searchTerm ? 'Modifiez votre recherche pour retrouver un produit.' : 'Utilisez le cœur dans le catalogue pour conserver vos produits et services.'} />
        ) : viewMode === 'grid' ? (
          <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">{filteredFavorites.map((item) => <FavoriteCard key={`${item.type}-${item.id}`} item={item} onRemove={removeFavorite} onAddToCart={addToCart} />)}</div>
        ) : (
          <div className="divide-y divide-border">{filteredFavorites.map((item) => <FavoriteRow key={`${item.type}-${item.id}`} item={item} onRemove={removeFavorite} onAddToCart={addToCart} />)}</div>
        )}
      </AppPanel>
    </div>
  );
}

function ItemImage({ item, size = 'card' }: { item: FavoriteItem; size?: 'card' | 'row' }) {
  const dimensions = size === 'card' ? 'aspect-[4/3] w-full' : 'h-24 w-24 shrink-0 sm:h-28 sm:w-28';
  return <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${dimensions}`}>{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <Heart className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />}</div>;
}

function ItemMeta({ item }: { item: FavoriteItem }) {
  return <div className="flex flex-wrap items-center gap-2"><StatusBadge tone={item.type === 'article' ? 'info' : 'neutral'}>{item.type === 'article' ? 'Produit' : 'Service'}</StatusBadge>{item.type === 'article' && item.stock !== undefined && <StatusBadge tone={item.stock > 0 ? 'success' : 'danger'}>{item.stock > 0 ? `${item.stock} en stock` : 'Rupture'}</StatusBadge>}</div>;
}

function FavoriteCard({ item, onRemove, onAddToCart }: { item: FavoriteItem; onRemove: (type: FavoriteType, id: string) => void; onAddToCart: (item: FavoriteItem) => void }) {
  return <article className="flex flex-col bg-card"><ItemImage item={item} /><div className="flex flex-1 flex-col p-5"><ItemMeta item={item} /><h2 className="mt-4 text-lg font-bold text-foreground">{item.name}</h2>{item.category && <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>}<p className="mt-4 text-xl font-bold text-[#124a93]">{formatCurrency(item.price)}</p><div className="mt-5 flex gap-2"><Button className="h-11 flex-1 bg-[#124a93] text-white hover:bg-[#0b3978]" disabled={item.type === 'article' && item.stock === 0} onClick={() => onAddToCart(item)}><ShoppingCart className="mr-2 h-4 w-4" /> Ajouter</Button><Button variant="outline" size="icon" className="h-11 w-11 border-red-200 text-[#b7212d] hover:bg-red-50 hover:text-[#941b25]" onClick={() => onRemove(item.type, item.id)} aria-label={`Retirer ${item.name} des favoris`}><Trash2 className="h-4 w-4" /></Button></div></div></article>;
}

function FavoriteRow({ item, onRemove, onAddToCart }: { item: FavoriteItem; onRemove: (type: FavoriteType, id: string) => void; onAddToCart: (item: FavoriteItem) => void }) {
  return <article className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"><ItemImage item={item} size="row" /><div className="min-w-0 flex-1"><ItemMeta item={item} /><h2 className="mt-3 text-lg font-bold text-foreground">{item.name}</h2>{item.description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>}</div><div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end"><p className="text-lg font-bold text-[#124a93]">{formatCurrency(item.price)}</p><div className="flex gap-2"><Button className="h-10 bg-[#124a93] text-white hover:bg-[#0b3978]" disabled={item.type === 'article' && item.stock === 0} onClick={() => onAddToCart(item)}><ShoppingCart className="mr-2 h-4 w-4" />Ajouter</Button><Button variant="outline" size="icon" className="h-10 w-10 border-red-200 text-[#b7212d] hover:bg-red-50 hover:text-[#941b25]" onClick={() => onRemove(item.type, item.id)} aria-label={`Retirer ${item.name} des favoris`}><Trash2 className="h-4 w-4" /></Button></div></div></article>;
}
