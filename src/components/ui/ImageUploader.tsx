import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

interface ImageUploaderProps {
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
}

export default function ImageUploader({
  maxFiles = 5,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  onUploadComplete,
  onUploadError
}: ImageUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(async (fileList: FileList) => {
    const validFiles: File[] = [];
    
    // Validate files
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        onUploadError?.(`${file.name}: Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.`);
        continue;
      }
      
      // Check file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        onUploadError?.(`${file.name}: Fichier trop volumineux (max ${maxSizeMB}MB). Taille: ${sizeMB.toFixed(2)}MB`);
        continue;
      }
      
      // Check max files
      if (files.length + validFiles.length >= maxFiles) {
        onUploadError?.(`Maximum ${maxFiles} fichiers autorisés`);
        break;
      }
      
      validFiles.push(file);
    }

    // Create upload entries
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Upload files
    for (const uploadFile of newFiles) {
      await uploadImage(uploadFile);
    }
  }, [files, maxFiles, maxSizeMB, acceptedTypes, onUploadError]);

  const uploadImage = async (uploadFile: UploadedFile) => {
    try {
      // Simulate upload progress (in production, use actual upload)
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress } : f
        ));
      }

      // In production, upload to Supabase Storage or similar
      // const formData = new FormData();
      // formData.append('file', uploadFile.file);
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      // const { url } = await response.json();

      // For now, use the preview URL as the "uploaded" URL
      const url = uploadFile.preview;

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'success', url, progress: 100 } : f
      ));

      // Check if all uploads are complete
      setTimeout(() => {
        setFiles(currentFiles => {
          const allSuccess = currentFiles.every(f => f.status === 'success');
          if (allSuccess) {
            const urls = currentFiles.map(f => f.url!);
            onUploadComplete?.(urls);
          }
          return currentFiles;
        });
      }, 100);
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          error: 'Erreur lors de l\'upload' 
        } : f
      ));
      onUploadError?.(`Erreur lors de l'upload de ${uploadFile.file.name}`);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
  }, [files]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => files.length < maxFiles && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={files.length >= maxFiles}
          aria-label="Sélectionner des images à télécharger"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
          `}>
            <Upload className={`h-8 w-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragging 
                ? 'Déposez les fichiers ici' 
                : 'Glissez-déposez vos images ici'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ou cliquez pour sélectionner des fichiers
            </p>
          </div>
          
          <div className="text-xs text-gray-400">
            <p>Max {maxFiles} fichiers • {maxSizeMB}MB par fichier</p>
            <p>JPG, PNG, WebP, GIF</p>
            <p className="mt-1 font-medium">{files.length} / {maxFiles} fichiers</p>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Fichiers ({files.length})
            </h3>
            {files.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                className="text-xs"
              >
                Tout supprimer
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map(file => (
              <Card key={file.id} className="relative overflow-hidden">
                <CardContent className="p-0">
                  {/* Image Preview */}
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Overlay */}
                    {file.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                    
                    {file.status === 'success' && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    {file.status === 'error' && (
                      <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      aria-label={`Supprimer ${file.file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* File Info */}
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-medium truncate" title={file.file.name}>
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024).toFixed(0)} KB
                    </p>
                    
                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-1" />
                    )}
                    
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-600">{file.error}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
