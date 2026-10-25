import { useState } from 'react';
import { Image as ImageIcon, Upload, Folder, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import ImageUploader from '../ui/ImageUploader';
import ImageGallery, { type GalleryImage } from '../ui/ImageGallery';

export default function ImageManagementView() {
  
  // Sample images for demonstration
  const [images, setImages] = useState<GalleryImage[]>([
    {
      id: '1',
      url: '/images/saddlepoint-cameroon-workspace-v1.png',
      name: 'casque-audio.jpg',
      size: 245678,
      uploadedAt: new Date(2024, 0, 15),
      category: 'Articles',
      tags: ['audio', 'casque', 'technologie']
    },
    {
      id: '2',
      url: '/images/saddlepoint-cameroon-workspace-v1.png',
      name: 'lunettes-soleil.jpg',
      size: 189234,
      uploadedAt: new Date(2024, 0, 20),
      category: 'Articles',
      tags: ['mode', 'lunettes', 'accessoires']
    },
    {
      id: '3',
      url: '/images/saddlepoint-cameroon-workspace-v1.png',
      name: 'montre-connectee.jpg',
      size: 312456,
      uploadedAt: new Date(2024, 0, 25),
      category: 'Articles',
      tags: ['montre', 'technologie', 'smartwatch']
    },
    {
      id: '4',
      url: '/images/saddlepoint-cameroon-workspace-v1.png',
      name: 'sneakers.jpg',
      size: 278901,
      uploadedAt: new Date(2024, 1, 1),
      category: 'Articles',
      tags: ['chaussures', 'mode', 'sneakers']
    }
  ]);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleUploadComplete = (urls: string[]) => {
    const newImages: GalleryImage[] = urls.map((url, index) => ({
      id: `${Date.now()}-${index}`,
      url,
      name: `image-${Date.now()}-${index}.jpg`,
      size: Math.floor(Math.random() * 500000) + 100000,
      uploadedAt: new Date(),
      category: 'Non classé'
    }));
    
    setImages(prev => [...newImages, ...prev]);
    
    // Show success message
    alert(`${urls.length} image(s) uploadée(s) avec succès !`);
  };

  const handleUploadError = (error: string) => {
    alert(`Erreur: ${error}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      setImages(prev => prev.filter(img => img.id !== id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedImages.length === 0) return;
    
    if (confirm(`Supprimer ${selectedImages.length} image(s) ?`)) {
      setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedImages.length === 0) return;
    
    for (const id of selectedImages) {
      const image = images.find(img => img.id === id);
      if (image) {
        // Download each image
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
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error downloading ${image.name}:`, error);
        }
      }
    }
  };

  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ImageIcon className="h-8 w-8 text-purple-600" />
            Gestion des Images
          </h1>
          <p className="text-gray-600 mt-2">
            Uploadez, organisez et gérez vos images produits
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total d'images</p>
                <p className="text-3xl font-bold text-blue-600">{images.length}</p>
              </div>
              <ImageIcon className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Espace utilisé</p>
                <p className="text-3xl font-bold text-purple-600">{formatSize(totalSize)}</p>
              </div>
              <Folder className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Catégories</p>
                <p className="text-3xl font-bold text-green-600">
                  {new Set(images.map(img => img.category)).size}
                </p>
              </div>
              <Folder className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="gallery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gallery" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Galerie
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Galerie d'images</CardTitle>
                  <CardDescription>
                    Gérez vos images uploadées
                  </CardDescription>
                </div>
                
                {/* Bulk Actions */}
                {selectedImages.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadSelected}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger ({selectedImages.length})
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer ({selectedImages.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ImageGallery
                images={images}
                onDelete={handleDelete}
                selectionMode={true}
                selectedIds={selectedImages}
                onSelect={(image) => {
                  setSelectedImages(prev => 
                    prev.includes(image.id)
                      ? prev.filter(id => id !== image.id)
                      : [...prev, image.id]
                  );
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload d'images</CardTitle>
              <CardDescription>
                Ajoutez de nouvelles images à votre galerie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                maxFiles={10}
                maxSizeMB={5}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </CardContent>
          </Card>

          {/* Upload Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">💡 Conseils pour l'upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✓ Utilisez des images de haute qualité (min 800x800px)</p>
              <p>✓ Formats recommandés: JPG pour photos, PNG pour logos/transparence</p>
              <p>✓ Nommez vos fichiers de manière descriptive (ex: "montre-sport-bleu.jpg")</p>
              <p>✓ Compressez les grandes images avant l'upload pour économiser l'espace</p>
              <p>✓ Utilisez WebP pour une meilleure compression (optionnel)</p>
            </CardContent>
          </Card>

          {/* Features Coming Soon */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-base">🚀 Fonctionnalités à venir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Optimisation automatique des images (resize, compress)</p>
              <p>• Conversion automatique en WebP</p>
              <p>• Édition d'images (crop, filters, resize)</p>
              <p>• Organisation par dossiers/collections</p>
              <p>• Intégration directe avec Supabase Storage</p>
              <p>• CDN pour chargement rapide</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
