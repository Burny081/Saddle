import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabaseClient';
import { 
  Heart, 
  ShoppingCart, 
  Trash2,
  Grid3x3,
  List,
  Search
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  type: 'article' | 'service';
  category?: string;
  description?: string;
  image_url?: string;
  stock?: number;
}

export default function ClientFavoritesView() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      // Get favorites from localStorage
      const storedFavorites = localStorage.getItem(`favorites_${user.id}`);
      const favoriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (favoriteIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch articles
      const { data: articles } = await supabase
        .from('articles')
        .select('id, name, sale_price, category, description, image_url, stock')
        .in('id', favoriteIds);

      // Fetch services
      const { data: services } = await supabase
        .from('services')
        .select('id, name, price, category, description')
        .in('id', favoriteIds);

      const allFavorites: FavoriteItem[] = [
        ...(articles || []).map(item => ({
          ...item,
          type: 'article' as const,
          price: item.sale_price
        })),
        ...(services || []).map(item => ({
          ...item,
          type: 'service' as const
        }))
      ];

      setFavorites(allFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (itemId: string) => {
    if (!user) return;

    const storedFavorites = localStorage.getItem(`favorites_${user.id}`);
    const favoriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];
    const updated = favoriteIds.filter((id: string) => id !== itemId);
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updated));

    setFavorites(favorites.filter(item => item.id !== itemId));
  };

  const addToCart = (item: FavoriteItem) => {
    // Get existing cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists
    const existingIndex = cart.findIndex((cartItem: any) => cartItem.id === item.id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        type: item.type,
        image_url: item.image_url
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Article ajouté au panier !');
  };

  const filteredFavorites = favorites.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-pink-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Mes Favoris
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredFavorites.length} {filteredFavorites.length > 1 ? 'articles' : 'article'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'}`}
              aria-label="Vue grille"
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'}`}
              aria-label="Vue liste"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredFavorites.length === 0 && (
        <div className="text-center py-20">
          <Heart className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Aucun résultat' : 'Aucun favori'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm
              ? 'Essayez une autre recherche'
              : 'Ajoutez des articles à vos favoris pour les retrouver facilement'}
          </p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredFavorites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavorites.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 dark:bg-slate-800"
            >
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Heart className="h-20 w-20 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group/remove"
                  aria-label="Retirer des favoris"
                >
                  <Trash2 className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover/remove:text-red-600 dark:group-hover/remove:text-red-400" />
                </button>

                {/* Type Badge */}
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-pink-600 to-red-600 text-white border-0">
                  {item.type === 'article' ? 'Produit' : 'Service'}
                </Badge>

                {/* Stock Badge for Articles */}
                {item.type === 'article' && item.stock !== undefined && (
                  <Badge
                    className={`absolute bottom-3 left-3 ${
                      item.stock > 10
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : item.stock > 0
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {item.stock > 0 ? `Stock: ${item.stock}` : 'Rupture'}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
                  {item.name}
                </h3>
                {item.category && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.category}</p>
                )}
                <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
                  {item.price.toLocaleString()} FCFA
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => addToCart(item)}
                    disabled={item.type === 'article' && item.stock === 0}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredFavorites.length > 0 && (
        <div className="space-y-4">
          {filteredFavorites.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-xl transition-shadow border-0 dark:bg-slate-800"
            >
              <div className="flex items-center gap-6 p-4">
                {/* Image */}
                <div className="relative w-32 h-32 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 rounded-lg overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">{item.name}</h3>
                    <Badge className="bg-gradient-to-r from-pink-600 to-red-600 text-white border-0">
                      {item.type === 'article' ? 'Produit' : 'Service'}
                    </Badge>
                  </div>
                  
                  {item.category && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.category}</p>
                  )}
                  
                  {item.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                      {item.price.toLocaleString()} FCFA
                    </p>
                    
                    {item.type === 'article' && item.stock !== undefined && (
                      <Badge
                        className={
                          item.stock > 10
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : item.stock > 0
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }
                      >
                        {item.stock > 0 ? `Stock: ${item.stock}` : 'Rupture'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => addToCart(item)}
                    disabled={item.type === 'article' && item.stock === 0}
                    className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Ajouter au panier
                  </Button>
                  <Button
                    onClick={() => removeFavorite(item.id)}
                    variant="outline"
                    className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Retirer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
