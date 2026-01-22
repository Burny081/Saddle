import { useState, useCallback, useRef } from 'react';
import { Upload, Link, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/app/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/app/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    label = 'Image',
    placeholder,
    className = ''
}: ImageUploadProps) {
    const { t } = useLanguage();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [urlInput, setUrlInput] = useState(value || '');
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'url' | 'upload'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const effectivePlaceholder = placeholder || t('placeholder.imageUrl');

    // Handle URL input
    const handleUrlChange = useCallback((url: string) => {
        setUrlInput(url);
        setError(null);
        if (url) {
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    }, []);

    // Handle file selection
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image valide');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('L\'image ne doit pas dépasser 5 Mo');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Convert to base64 for preview and storage
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setPreviewUrl(result);
            setUrlInput(result);
            setIsLoading(false);
        };
        reader.onerror = () => {
            setError('Erreur lors de la lecture du fichier');
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    }, []);

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Veuillez déposer une image valide');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('L\'image ne doit pas dépasser 5 Mo');
            return;
        }

        setIsLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setPreviewUrl(result);
            setUrlInput(result);
            setIsLoading(false);
        };
        reader.onerror = () => {
            setError('Erreur lors de la lecture du fichier');
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Confirm selection
    const handleConfirm = useCallback(() => {
        if (urlInput) {
            onChange(urlInput);
        }
        setIsDialogOpen(false);
    }, [urlInput, onChange]);

    // Clear image
    const handleClear = useCallback(() => {
        setUrlInput('');
        setPreviewUrl(null);
        onChange('');
    }, [onChange]);

    // Open dialog
    const openDialog = useCallback(() => {
        setUrlInput(value || '');
        setPreviewUrl(value || null);
        setError(null);
        setIsDialogOpen(true);
    }, [value]);

    return (
        <div className={className}>
            {label && <Label className="mb-2 block">{label}</Label>}

            {/* Preview / Trigger */}
            <div
                className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={openDialog}
            >
                {value ? (
                    <div className="relative">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-32 object-contain rounded-lg bg-slate-50 dark:bg-slate-800"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-slate-500">
                        <ImageIcon className="h-8 w-8 mb-2" />
                        <span className="text-sm">{effectivePlaceholder}</span>
                        <span className="text-xs mt-1">{t('imageUpload.clickToAdd')}</span>
                    </div>
                )}
            </div>

            {/* Upload Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('imageUpload.title')}</DialogTitle>
                        <DialogDescription>
                            {t('imageUpload.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'url' | 'upload')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="url" className="flex items-center gap-2">
                                <Link className="h-4 w-4" />
                                URL
                            </TabsTrigger>
                            <TabsTrigger value="upload" className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                {t('imageUpload.browse')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="url" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-url">{t('imageUpload.imageUrl')}</Label>
                                <Input
                                    id="image-url"
                                    type="url"
                                    placeholder="https://exemple.com/image.jpg"
                                    value={urlInput.startsWith('data:') ? '' : urlInput}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="upload" className="space-y-4 mt-4">
                            <div
                                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                {isLoading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                                        <span className="text-sm text-slate-500">{t('loading')}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                        <span className="text-sm font-medium">{t('imageUpload.dropHere')}</span>
                                        <span className="text-xs text-slate-500 mt-1">PNG, JPG, GIF (max 5 Mo)</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    aria-label={t('imageUpload.browse')}
                                    title={t('imageUpload.browse')}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Preview */}
                    {previewUrl && (
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-500 mb-2">{t('imageUpload.preview')}:</p>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-40 mx-auto object-contain rounded-lg"
                                onError={() => setError(t('error.invalidImage'))}
                            />
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            {t('action.cancel')}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!previewUrl || isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {t('action.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Compact inline version for forms
interface InlineImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
}

export function InlineImageUpload({ value, onChange, className = '' }: InlineImageUploadProps) {
    const { t } = useLanguage();
    const [inputValue, setInputValue] = useState(value || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setInputValue(result);
            onChange(result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            <Input
                type="text"
                placeholder={t('imageUpload.imageUrl')}
                value={inputValue.startsWith('data:') ? t('imageUpload.imported') : inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    onChange(e.target.value);
                }}
                className="flex-1"
                readOnly={inputValue.startsWith('data:')}
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title={t('imageUpload.browse')}
            >
                <Upload className="h-4 w-4" />
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-label={t('imageUpload.browse')}
                title={t('imageUpload.browse')}
            />
            {inputValue && (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        setInputValue('');
                        onChange('');
                    }}
                    title={t('action.delete')}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
