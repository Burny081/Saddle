import { useState, useCallback } from 'react';
import { Download, Eye, Trash2, Search, Grid3x3, List, SortAsc, SortDesc, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export interface GalleryImage {
  id: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
  category?: string;
  tags?: string[];
}

interface ImageGalleryProps {
  images: GalleryImage[];
  onSelect?: (image: GalleryImage) => void;
  onDelete?: (id: string) => void;
  onDownload?: (image: GalleryImage) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
}

export default function ImageGallery({
  images,
  onSelect,
  onDelete,
  onDownload,
  selectionMode = false,
  selectedIds = []
}: ImageGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(images.map(img => img.category).filter(Boolean)));

  // Filter images
  const filteredImages = images.filter(img => {
    const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || img.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort images
  const sortedImages = [...filteredImages].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleImageClick = useCallback((image: GalleryImage) => {
    if (selectionMode) {
      onSelect?.(image);
    } else {
      setPreviewImage(image);
    }
  }, [selectionMode, onSelect]);

  const handleDownload = useCallback(async (image: GalleryImage) => {
    if (onDownload) {
      onDownload(image);
    } else {
      // Default download behavior
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = image.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download error:', error);
      }
    }
  }, [onDownload]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom ou tag..."
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="size">Taille</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>

        {/* View Mode */}
        <div className="flex gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>{sortedImages.length} image{sortedImages.length !== 1 ? 's' : ''}</p>
        {selectionMode && selectedIds.length > 0 && (
          <p className="font-medium text-blue-600">{selectedIds.length} sélectionnée{selectedIds.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Images */}
      {sortedImages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">Aucune image trouvée</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Essayez de modifier vos filtres' 
                : 'Commencez par uploader des images'
              }
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedImages.map(image => (
            <Card 
              key={image.id} 
              className={`
                relative overflow-hidden cursor-pointer transition-all hover:shadow-lg
                ${selectedIds.includes(image.id) ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => handleImageClick(image)}
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="aspect-square relative bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(image);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(image.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium truncate" title={image.name}>
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedImages.map(image => (
            <Card 
              key={image.id}
              className={`
                cursor-pointer transition-all hover:shadow-md
                ${selectedIds.includes(image.id) ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => handleImageClick(image)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>{formatFileSize(image.size)}</span>
                      <span>•</span>
                      <span>{formatDate(image.uploadedAt)}</span>
                      {image.category && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">{image.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(image);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(image.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewImage !== null} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.name}</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              {/* Image */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  className="w-full max-h-[60vh] object-contain"
                />
              </div>
              
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Taille</p>
                  <p className="font-medium">{formatFileSize(previewImage.size)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date d'upload</p>
                  <p className="font-medium">{formatDate(previewImage.uploadedAt)}</p>
                </div>
                {previewImage.category && (
                  <div>
                    <p className="text-gray-600">Catégorie</p>
                    <p className="font-medium">{previewImage.category}</p>
                  </div>
                )}
                {previewImage.tags && previewImage.tags.length > 0 && (
                  <div>
                    <p className="text-gray-600">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewImage.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={() => handleDownload(previewImage)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                {onDelete && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      onDelete(previewImage.id);
                      setPreviewImage(null);
                    }}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
