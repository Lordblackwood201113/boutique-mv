import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface CatalogProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ products, onViewProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUT');

  // Derive unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return ['TOUT', ...uniqueCategories.sort()];
  }, [products]);

  // Filter products based on selection
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'TOUT') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <section className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col mb-12 text-center">
        <span className="font-sans text-xs tracking-[0.2em] text-gray-400 uppercase mb-4">Collection 2025</span>
        <h2 className="font-serif text-4xl md:text-5xl text-mv-black mb-12">Le Catalogue</h2>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 border-b border-gray-100 pb-6 w-full overflow-x-auto no-scrollbar">
          {categories.map((category) => (
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

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 animate-fade-in">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer flex flex-col gap-4"
              onClick={() => onViewProduct(product)}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
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
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="font-serif text-xl text-gray-400 italic">Aucun produit dans cette catégorie.</p>
          </div>
        )}
      </div>
    </section>
  );
};
