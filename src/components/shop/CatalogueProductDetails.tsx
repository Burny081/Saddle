import { useState } from 'react';
import { CheckCircle2, Heart, Layers3, PackageCheck, Plus, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { CatalogueShopProduct } from '@/data/catalogue';
import {
  getProductConfigurationFields,
  type SelectedProductConfiguration,
} from '@/data/catalogue/productConfiguration';

interface CatalogueProductDetailsProps {
  product: CatalogueShopProduct;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToQuote: (configuration: SelectedProductConfiguration) => void;
  onClose: () => void;
}

export function CatalogueProductDetails({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToQuote,
  onClose,
}: CatalogueProductDetailsProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = product.images ?? (product.image ? [product.image] : []);
  const activeImage = images[activeImageIndex];
  const configurationFields = getProductConfigurationFields(product);
  const [configuration, setConfiguration] = useState<SelectedProductConfiguration>({});

  return (
    <article className="mx-auto max-w-5xl space-y-6 p-5 pt-0 sm:p-6 sm:pt-0">
      <header className="border-b border-border pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#b7212d]">
              {product.marque}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.categorie} · {product.sousCategorie}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label={`Ajouter ${product.nom} aux favoris`}
            onClick={onToggleFavorite}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-[#b7212d] text-[#b7212d]' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Fermer la fiche produit"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground">{product.nom}</h1>
      </header>

      <section
        data-testid="product-gallery"
        aria-label="Galerie produit"
        className="mx-auto w-full max-w-2xl"
      >
        {activeImage ? (
          <>
            <img
              src={activeImage}
              alt={product.altImage}
              className="aspect-[16/7] max-h-[28vh] w-full border border-border bg-slate-100 object-contain"
            />
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`Voir l’image ${index + 1}`}
                  aria-pressed={index === activeImageIndex}
                  onClick={() => setActiveImageIndex(index)}
                  className={`aspect-[4/3] overflow-hidden border-2 ${index === activeImageIndex ? 'border-[#124a93]' : 'border-transparent'}`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <p
            data-testid="product-images-pending"
            className="border-l-2 border-[#124a93] bg-[#124a93]/5 px-4 py-4 text-sm leading-6 text-muted-foreground"
          >
            Visuels produit en préparation. Cette fiche ne montre pas d’image générique ou d’un
            autre article.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-muted/30 p-4 lg:mt-6">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <PackageCheck className="h-4 w-4 text-[#124a93]" />
          Disponibilité
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {product.disponibilite}. Configuration et quantité confirmées par notre équipe avant
          devis.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-foreground">Description</h3>
        <p className="mt-3 leading-7 text-muted-foreground">{product.description}</p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-foreground">Caractéristiques techniques</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {product.caracteristiques.map((item) => (
            <li
              key={item}
              className="flex gap-2 border border-border p-3 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b7212d]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {configurationFields.length > 0 && (
        <section className="rounded-lg border border-[#124a93]/20 bg-[#124a93]/5 p-4">
          <h3 className="text-lg font-bold text-foreground">Configuration technique souhaitée</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choisissez vos besoins : ils seront confirmés par notre équipe dans le devis.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {configurationFields.map((field) => (
              <label key={field.key} className="grid gap-1.5 text-sm font-semibold text-foreground">
                {field.label}
                <select
                  aria-label={field.label}
                  value={configuration[field.key] ?? ''}
                  onChange={(event) =>
                    setConfiguration((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                  className="h-11 border border-border bg-background px-3 text-sm font-normal"
                >
                  <option value="">À choisir</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-lg font-bold text-foreground">Usages recommandés</h3>
        <p className="mt-2 text-sm font-medium text-[#124a93]">
          {product.usage} · {product.gammeMarque}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.applications.map((item) => (
            <span
              key={item}
              className="border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-foreground">Variantes disponibles</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.variantesDisponibles.map((item) => (
            <span
              key={item}
              className="border border-[#124a93]/20 bg-[#124a93]/5 px-3 py-2 text-sm font-medium text-[#124a93]"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Layers3 className="h-5 w-5 text-[#124a93]" />
          Compatibilités & alternatives
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Compléments : {product.produitsComplementaires.join(' · ')}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Marques alternatives : {product.alternativesCompatibles.join(' · ')}
        </p>
      </section>

      <div
        data-testid="quote-request-cta"
        className="-mx-5 border-t border-border bg-background p-4 sm:-mx-6"
      >
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 font-bold" onClick={onClose}>
            Fermer
          </Button>
          <Button
            className="h-12 bg-[#124a93] font-bold text-white hover:bg-[#0b3978]"
            onClick={() => onAddToQuote(configuration)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Ajouter au devis
          </Button>
        </div>
      </div>
    </article>
  );
}
