import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Product } from '@/types';

interface CatalogProps {
  products: Product[];
  categories: string[];
  onViewProduct: (product: Product) => void;
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const [imageIndex, setImageIndex] = useState(0);
  const images = product.images.length > 0 ? product.images : [''];
  const hasMultiple = images.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((i) => (i - 1 + images.length) % images.length);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((i) => (i + 1) % images.length);
  };

  const goTo = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    setImageIndex(i);
  };

  return (
    <div className="group cursor-pointer flex flex-col gap-4" onClick={onClick}>
      {/* Image carousel */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              i === imageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

        {hasMultiple && (
          <>
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm text-mv-black rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 hover:bg-white transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm text-mv-black rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 hover:bg-white transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => goTo(e, i)}
                  aria-label={`Voir image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === imageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
          <h3 className="font-serif text-xl text-mv-black">{product.name}</h3>
          <span className="font-sans font-bold text-sm text-mv-black">
            {product.price.toLocaleString('fr-FR')} {product.currency}
          </span>
        </div>
        <p className="font-sans text-xs text-gray-500 uppercase tracking-widest line-clamp-1">
          {product.category}
        </p>
        <p className="font-sans text-sm text-gray-400 font-light line-clamp-2 mt-1">
          {product.description}
        </p>
      </div>
    </div>
  );
}

export const Catalog: React.FC<CatalogProps> = ({ products, categories, onViewProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUT');
  const [searchQuery, setSearchQuery] = useState('');

  // Use admin-defined category order, plus any orphan categories from products
  const filterCategories = useMemo(() => {
    const productCategories = new Set(products.map((p) => p.category));
    const orphans = Array.from(productCategories)
      .filter((c) => !categories.includes(c))
      .sort();
    return ['TOUT', ...categories, ...orphans];
  }, [products, categories]);

  // Filter products by category + search query
  const filteredProducts = useMemo(() => {
    const byCategory = selectedCategory === 'TOUT'
      ? products
      : products.filter((p) => p.category === selectedCategory);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return byCategory;

    return byCategory.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [products, selectedCategory, searchQuery]);

  return (
    <section className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col mb-12 text-center">
        <span className="font-sans text-xs tracking-[0.2em] text-gray-400 uppercase mb-4">Collection 2025</span>
        <h2 className="font-serif text-4xl md:text-5xl text-mv-black mb-10">Le Catalogue</h2>

        {/* Search bar */}
        <div className="w-full max-w-lg mx-auto mb-10">
          <div className={`relative flex items-center border-b transition-colors duration-300 ${
            searchQuery ? 'border-mv-black' : 'border-gray-200 focus-within:border-mv-black'
          }`}>
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="flex-1 bg-transparent font-sans text-sm px-3 py-3 outline-none placeholder:text-gray-400 placeholder:italic"
              aria-label="Rechercher un produit"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Effacer la recherche"
                className="flex-shrink-0 p-1 text-gray-400 hover:text-mv-black transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 border-b border-gray-100 pb-6 w-full overflow-x-auto no-scrollbar">
          {filterCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`font-sans text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 pb-2 relative whitespace-nowrap ${
                selectedCategory === category
                  ? 'text-mv-black'
                  : 'text-gray-400 hover:text-mv-black'
              }`}
            >
              {category}
              {/* Active Indicator line */}
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-mv-black transition-transform duration-300 origin-left ${
                selectedCategory === category ? 'scale-x-100' : 'scale-x-0'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="font-sans text-sm text-gray-500 mb-6 text-center">
          {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} pour « {searchQuery} »
        </p>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 animate-fade-in">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onViewProduct(product)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="font-serif text-xl text-gray-400 italic">
              {searchQuery ? 'Aucun produit ne correspond à votre recherche.' : 'Aucun produit dans cette catégorie.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
