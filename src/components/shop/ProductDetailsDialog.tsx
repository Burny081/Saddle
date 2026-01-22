import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Heart, ShoppingCart, Check, Shield, Truck } from "lucide-react";
import type { Article, Service } from "@/types/compatibility";
import { motion } from "motion/react";
import { formatCurrency } from '@/config/constants';

interface ProductDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    item: (Article | Service) & { type: 'article' | 'service' };
    onAddToCart: (item: (Article | Service) & { type: 'article' | 'service' }) => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

export function ProductDetailsDialog({ open, onClose, item, onAddToCart, isFavorite, onToggleFavorite }: ProductDetailsDialogProps) {
    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl">
                <div className="grid md:grid-cols-2 h-full min-h-[500px]">
                    {/* Image Section */}
                    <div className="relative h-full min-h-[300px] bg-slate-100 dark:bg-slate-800 p-8 flex items-center justify-center">
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain max-h-[400px] drop-shadow-xl"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md hover:bg-red-50 hover:text-red-500 transition-colors"
                            onClick={onToggleFavorite}
                        >
                            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 flex flex-col h-full">
                        <DialogHeader className="mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
                                    {item.type === 'service' ? 'Service' : 'Produit'}
                                </Badge>
                                <span>{item.category}</span>
                            </div>
                            <DialogTitle className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                {item.name}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 space-y-6">
                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-bold text-blue-600">
                                    {formatCurrency(item.price)}
                                </span>
                                {item.type === 'article' && 'stock' in item && (
                                    <span className={`text-sm px-2 py-1 rounded-full ${item.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {item.stock > 0 ? `${item.stock} en stock` : 'Rupture de stock'}
                                    </span>
                                )}
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {item.description || "Description complète du produit, spécifications techniques, avantages et cas d'utilisation. Ce produit est conçu pour répondre aux normes les plus exigeantes de l'industrie."}
                            </p>

                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <span>Garantie constructeur 2 ans</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Truck className="h-5 w-5 text-blue-500" />
                                    <span>Livraison rapide disponible</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                    <span>Paiement 100% sécurisé</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 flex gap-4">
                            <Button
                                className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1"
                                onClick={() => {
                                    onAddToCart(item);
                                    onClose();
                                }}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Ajouter au panier
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
